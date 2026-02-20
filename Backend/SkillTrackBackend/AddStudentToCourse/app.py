'''
/AddStudentToCourse


POST
Required Inputs 
Course_ID -  Course ID, ie. NRS-210-2026
Student_ID - Student email, ie . student1@gmail.com
'''

import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}


def add_student_to_course(event, context):

    claims = event["requestContext"]["authorizer"]["claims"]
    email = claims.get("email")

    statusCode = 0
    output_body =       ""    

    course_id_to_add_student_to = None
    student_to_add_to_course = None
    try:
        input_body = json.loads(event["body"])
        course_id_to_add_student_to =  input_body["Course_ID"]
        student_to_add_to_course = input_body["Student_ID"]
    except:
        statusCode = 400
        output_body = "error: The body of your request is formatted incorrectly"
        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        }

    try:
        calling_user_response = table.get_item(
            Key= {
                "ID": "USER#" + email
            }
        )
        #Attempt to fetch row for the user that called this function
        calling_user_info = calling_user_response.get("Item")
        roles = calling_user_info.get("Roles", [])
        teaches_these_courses = calling_user_info.get("TeachingTheseCourses", [])

        if not ("Admin" in roles) and not (("Teacher" in roles) and(course_id_to_add_student_to in teaches_these_courses)):
            statusCode = 403
            output_body = "error: You do not have permission to add students to this course"
            #return early if caller does not have permission to do this
            return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,
                "body": json.dumps(output_body)
            }
        
        #If they do have permission, we go through the process of adding the student, we will want to do two things: 
        #Add student into the course row itself AND add the course skill info to the student row.

        #extract data of course we are in the process of adding this student into
        new_course_data = table.get_item(
            Key ={
                "ID": f"COURSE#{course_id_to_add_student_to}"
            }
        ).get("Item")

        name_of_course =  new_course_data["CourseName"]


        #this section constructs the course to be inserted into the student row 
        new_course_to_insert_to_student_row ={
            "CourseName": name_of_course,
            "Skills": {}
        }


        #Since skill names have a description field nested within it, we just get a list of the pure skill names by doing .keys()
        skills_list = new_course_data["Skills"].keys()

        for skill in skills_list:
            #new_course_to_insert_to_student_row["Skills"][skill] = False <--- Previous format without the nested structure that could only indicate if skill was checked off or not
            new_course_to_insert_to_student_row["Skills"][skill] = {
                "CheckedOff": False,
                "DateCheckedOff": "",
                "CheckedOffBy": ""
            }

        
        #new_course_to_insert_to_student_row now fully contains the course data, will all skills unchecked. We will insert this to the student row, where the check off state will be housed.
        table.update_item(
            Key ={
                "ID": f"USER#{student_to_add_to_course}"
            },
            UpdateExpression="SET #Courses.#NEWCOURSE = :course",
            ConditionExpression="attribute_not_exists(#Courses.#NEWCOURSE)",
            ExpressionAttributeNames={
                "#Courses":         'Courses',
                '#NEWCOURSE':       course_id_to_add_student_to
            },
            ExpressionAttributeValues={
                ":course": new_course_to_insert_to_student_row
            }
        )


        #Add student email to roster of students enrolled in this course.
        table.update_item(
            Key ={
                "ID": f"COURSE#{course_id_to_add_student_to}"
            },
            UpdateExpression = "ADD Students :new",
            ExpressionAttributeValues = {
                ":new": {student_to_add_to_course}
            },
            ConditionExpression="attribute_exists(ID)"
        )


        statusCode = 200
        output_body = "successfully added student to course "

    except Exception as e:
        statusCode = 500
        output_body = "failed to fully add student to course. Ended with this error: " + str(e)

    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,
        "body": json.dumps(output_body)
    }
