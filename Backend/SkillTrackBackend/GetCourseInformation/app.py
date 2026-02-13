'''
/GetCourseData

GET,

required input: Course_ID as a query parameter in the URL

'''
import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}



#ONLY USE THIS FUNCTION IF YOU HAVE VERIFIED THE CALLER HAS PERMISSION TO EXTRACT STUDENT INFO, THE FUNCTION ITSELF WILL NOT DO THIS!!!
def combine_course_info_with_studentSkillData(listOfStudentEmails, course_info_dict, course_id):
    course_info_dict["StudentsExtended"] = {}
    for studentEmail in listOfStudentEmails:
        currStudent = table.get_item(Key= {"ID": "USER#" + studentEmail}).get("Item")
        
        for key in list(currStudent["Courses"]):
            if key != course_id:
                currStudent["Courses"].pop(key)
        

        course_info_dict["StudentsExtended"][studentEmail] = normalize_string_sets(currStudent)

    return course_info_dict



#python does not like the string set for some reason when calling json.dumps() (which is the final operation we use to return the data as an http response), so use this function to turn any string sets as a list.  
def normalize_string_sets(item):
    
    for key, value in item.items():
        if isinstance(value, set):
            item[key] = list(value)
    return item


def get_course_information(event, context):

    claims = event["requestContext"]["authorizer"]["claims"]
    calling_user_email = claims.get("email")

    statusCode = 0
    output_body =       ""
    courseID_to_get_info_about = ""
    try:
        courseID_to_get_info_about = event["queryStringParameters"]["Course_ID"]
    except:
        statusCode = 400
        output_body = "Incorrectly formatted API call"
        return {
            "statusCode": statusCode,
            "headers": GlobalHeaders,       
            "body": json.dumps(output_body)
        }

    try:
        #first we verify if the calling user has either the Teacher or Admin role 
        caller_user_row =  table.get_item(Key= {"ID": "USER#" + calling_user_email}).get("Item")
        user_roles = caller_user_row.get("Roles", [])
        teaching_courses = caller_user_row.get("TeachingTheseCourses", [])
        
        
        course_info = table.get_item(Key={"ID": "COURSE#"+ courseID_to_get_info_about }).get("Item")

        student_roster = course_info.get("Students", [])

        #Admin can get any course info, teacher must be teaching that course, student must be enrolled in that coure
        if not ("Admin" in user_roles) and not (("Teacher" in user_roles) and (courseID_to_get_info_about in teaching_courses)) and not(("Student" in user_roles) and (calling_user_email in student_roster) ):
            statusCode = 403
            output_body = "Error: You do not have permission to view class details"
            return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }
        

        #eliminate student roster if their role is only student
        if(not ("Admin" in user_roles) and not ("Teacher" in user_roles)):
            course_info.pop("Students" , None)
        
        course_info = normalize_string_sets(course_info)
        
        statusCode = 200
        output_body = course_info

        #If they are either a admin or a teacher, they can get student information returned along with everything else
        #we already verified the teacher has permission to do this


        get_all_student_skill_info = event["queryStringParameters"].get("GetAllStudentsExtendedSkillInformation", "")
        
        if((("Admin" in user_roles) or("Teacher" in user_roles)) and not (get_all_student_skill_info == "True" or get_all_student_skill_info == "true")):
            params = event.get("multiValueQueryStringParameters") or {}
            studentEmails = params.get("Student_Emails", [])
            output_body = combine_course_info_with_studentSkillData(studentEmails, course_info, courseID_to_get_info_about)
        elif((("Admin" in user_roles) or("Teacher" in user_roles)) and (get_all_student_skill_info == "True" or get_all_student_skill_info == "true") ):
            output_body = combine_course_info_with_studentSkillData(student_roster, course_info,courseID_to_get_info_about)
        
    
                



    
    except Exception as e:
        statusCode = 500
        output_body = "Error reading data from the database. Ended with this error: " + str(e)
        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,       
            "body": json.dumps(output_body)
        }
    

    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)
    }
