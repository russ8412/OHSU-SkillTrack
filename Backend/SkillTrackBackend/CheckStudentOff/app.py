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


    #first we check if this user has the proper role to check somebody off
    try:
    # Fetch an item by primary key, the email
        response = table.get_item(
            Key= {
                "Email": email
            }
        )
        
        calling_user_info = response.get("Item")
        roles = calling_user_info.get("Roles", [])

        #set to admin for now, later we will need to set it so "Teacher" role can check off
        if "Admin" not in roles:
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
    year = None
    course = None
    skill_name = None
    try:
        student_list = input_body["Student_list"]
        year = input_body["Year"]
        course = input_body["Course"]
        skill_name = input_body["Skill_name"]

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
    

    #by this point we should have a correctly formatted request

    #for now there is just a generic error if there is any failure (ie. 3 of 5 sucessfull entries still gives the same error)
    #it may be worth to make a more specific error, saying which students were failed and such
    
    #This section likely needs the largest overhaul


    try:
        for student_email in student_list:

            student_row = table.get_item(Key={"Email": email})
            student_row_json = student_row["Item"]
            
            
            years_list = student_row_json["Years"]
            y_index = None
            i = 0
            for y in years_list:
                if y["Year"] == year:
                    y_index = i
                    break
                i+=1
            
            course_list = years_list[y_index]["Courses"]
            i =0
            c_index = None
            for c in course_list:
                if c["CourseName"] == course:
                    c_index = i
                    break
                i+=1
            


            #see if we can find the indexes of what we want to update
            
            table.update_item(
                Key = {"Email": student_email},
                UpdateExpression = f"SET Years[{y_index}].Courses[{c_index}].Skills.#skill = :sk",
                ExpressionAttributeNames={
                    "#skill": skill_name
                },
                ExpressionAttributeValues={
                    ":sk": True
                },
                ConditionExpression=f"attribute_exists(Years[{y_index}].Courses[{c_index}].Skills.#skill)"

            )
        
        statusCode = 200
        output_body = "made it right to the point where we have to make the call!"
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


