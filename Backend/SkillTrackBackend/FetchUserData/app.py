'''
/FetchUserData Function definition

GET, not inputs besides authorization required
optional input of array of student emails, in which case this function will switch modes and actually fetch data for student(s) rather than the calling user 
Any teacher can currently call thi

This fetches the row of data for the user is logged in to the app. This endpoint is not (at least currently) meant to return the data of other users
'''
import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}


#python does not like the string set for some reason when calling json.dumps() (which is the final operation we use to return the data as an http response), so use this function to turn any string sets as a list.  
def normalize_string_sets(item):
    
    for key, value in item.items():
        if isinstance(value, set):
            item[key] = list(value)
    return item



#This function is the main logic
def lambda_handler(event, context):
    claims = event["requestContext"]["authorizer"]["claims"]
    email = claims.get("email")
    
    statusCode = 0
    body =       ""    

    #Attempt to fetch row for the user that called this function
    try:
    # Fetch an item by primary key, the email
        response = table.get_item(
            Key= {
                "ID": "USER#" +email
            }
        )
        
        item = response.get("Item")

        user_roles = item.get("Roles", [])
        params = event.get("multiValueQueryStringParameters") or {}
        studentEmails = params.get("Student_Emails", [])


        #This is the default fetch call, which we just return the data of the user that made this call
        if not studentEmails:
            statusCode = 200

            #python does not like the string set for some reason when calling json.dumps(), so use this function to turn any string sets as a list.      
            normalized_item = normalize_string_sets(item)            
            body = normalized_item
        #otherwise, if there are student emails passed in we will try to obtain the student data for those students.
        else:
            if (not ("Admin" in user_roles) and not ("Teacher" in user_roles)):
                statusCode = 403
                output_body = "Error: You do not have permission to view details for other users "
                return{
                    "statusCode": statusCode,
                    "headers": GlobalHeaders,       
                    "body": json.dumps(output_body)
                }
            
            #if we have permission, construct a list
            studentsData = {}
            for sEmail in studentEmails:
                currStudent = table.get_item(Key= {"ID": "USER#" + sEmail}).get("Item")

                if not currStudent:
                    continue    #this student not found, so skil plen

                currStudent = normalize_string_sets(currStudent)
                studentsData[sEmail] = currStudent
            
            statusCode = 200
            body = studentsData

    #exception triggered, typically if our attempt to read from the databse goes wrong for some reason.
    except Exception as e:
        statusCode = 500
        body = "Error reading data from the database. Ended with this error: " + str(e)
    
    #return code based on what happened.
    return {
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(body)
    }


