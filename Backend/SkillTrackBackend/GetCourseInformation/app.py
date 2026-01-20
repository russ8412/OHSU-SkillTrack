'''
/GetCourseData

GET, 

required input: Course name 


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

        if not ("Admin" in user_roles) and not ("Teacher" in user_roles):
            statusCode = 403
            output_body = "Error: You do not have permission to view class details"
            return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }
        
        course_info = table.get_item(Key={"ID": "COURSE#"+ courseID_to_get_info_about }).get("Item")
        
        course_info = normalize_string_sets(course_info)
        
        statusCode = 200
        output_body = course_info
    
    except:
        statusCode = 500
        output_body = "error reading data from the database"
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
