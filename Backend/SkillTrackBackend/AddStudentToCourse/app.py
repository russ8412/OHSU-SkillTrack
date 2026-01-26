'''
/AddStudentToCourse


POST
Required Inputs 
Course_ID -  Course ID, ie. NRS-210-2026
Student_ID - Student email, ie . student1@gmail.com
'''



import json

# import requests

import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}


def add_student_to_course(event, context):

    ##Attempt to fetch row for the user that called this function
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
        
        #If they do have permission, we go thru the process of adding the student, we will want to do two things. Add the student to the list on the course AND
        

        #add student into the course row itself
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


        new_course_data = table.get_item(
            Key ={
                "ID": f"COURSE#{course_id_to_add_student_to}"
            }
        ).get("Item")

        year_in_student_row_to_insert = new_course_data.get( "Year", {})
        name_of_course =  new_course_data["CourseName"]



        #this section constructs the course to be inserted into the student row 
        new_course_to_insert_to_student_row ={
            "CourseName": name_of_course,
            "Skills": {}
        }


        skills_list = new_course_data["Skills"]

        for skill in skills_list:
            new_course_to_insert_to_student_row["Skills"][skill] = False

        
        #course is fully

        #Here we will focus on adding student skills of the course to the student row
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
    


        statusCode = 200
        output_body = "successfully added student to course "

    except:
        statusCode = 500
        output_body = "failed to fully add student to course"

    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,
        "body": json.dumps(output_body)
    }
