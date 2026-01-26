'''
/CheckStudentOff


POST Request:
Required Inputs: 
Course_Year
Course_ID
Skill_Name
Student_List
'''




import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):


    ##Attempt to fetch row for the user that called this function
    claims = event["requestContext"]["authorizer"]["claims"]
    email = claims.get("email")

    statusCode = 0
    output_body =       ""    




    #First we check if the request is formatted correctly!


    input_body = None    
    #parse JSON body
    try:
        input_body = json.loads(event["body"])
    except:
        statusCode = 400
        output_body = "error: Invalid JSON in request body"

        return {
            "statusCode": statusCode,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },       
            "body": json.dumps(output_body)
        }

    #Each call to check a student off should have these components
    #student_list = []. List of student emails to be checked off 
    #year = year of skill to check off (ie. 1, 2, 3)
    #course = course of student 
    #skillname
    
    #Validate that we have all required inputs
    student_list = None
    course_id = None
    skill_name = None
    try:
        student_list = input_body["Student_List"]
        course_id = input_body["Course_ID"]
        skill_name = input_body["Skill_Name"]

        if(not isinstance(student_list, list)):
            raise
    except:
        statusCode = 400
        output_body = "error: The body of your request is formatted incorrectly"

        return {
            "statusCode": statusCode,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },       
            "body": json.dumps(output_body)
        }
    


    #first we check if this user has the proper role to check somebody off
    try:
    # Fetch an item by primary key, the email
        response = table.get_item(
            Key= {
                "ID": "USER#" + email
            }
        )
        
        calling_user_info = response.get("Item")
        roles = calling_user_info.get("Roles", [])
        teaches_these_courses = calling_user_info.get("TeachingTheseCourses", [])

        #set to admin for now, later we will need to set it so "Teacher" role can check off
        if not ("Admin" in roles) and not (("Teacher" in roles) and(course_id in teaches_these_courses)):
            statusCode = 403
            output_body = "error: You do not have permission to check students off"
            return {
                "statusCode": statusCode,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                    "Access-Control-Allow-Methods": "GET,OPTIONS"
                },       
                "body": json.dumps(output_body)
            }          
    except:
        statusCode = 500
        output_body = "error: Failed to read data from the database"
        return {
            "statusCode": statusCode,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },       
            "body": json.dumps(output_body)
        }


    


    #by this point we should have a correctly formatted request

    #for now there is just a generic error if there is any failure (ie. 3 of 5 sucessfull entries still gives the same error)
    #it may be worth to make a more specific error, saying which students were failed and such
    
    #This section likely needs the largest overhaul

    try:
        for student_email in student_list:

            #see if we can find the indexes of what we want to update

            table.update_item(
                Key = {"ID": "USER#" + student_email},
                UpdateExpression = "SET #Courses.#Course_ID.#Skills.#ParticularSkill = :val",
                ExpressionAttributeNames={
                    "#Courses":         'Courses',
                    "#Course_ID":       course_id,
                    "#Skills":           'Skills',
                    "#ParticularSkill":  skill_name
                },
                ExpressionAttributeValues={
                    ':val': True
                },
                ConditionExpression = "attribute_exists(#Courses.#Course_ID.#Skills.#ParticularSkill)"    
            )


        statusCode = 200
        output_body = "Successfully updated skill for students"
    except:
        statusCode = 500
        output_body = "Failed to update one or more skills"
 

    return {
        "statusCode": statusCode,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },       
        "body": json.dumps(output_body)
    }


