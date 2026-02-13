
'''

/GetListOfTemplates

#This particular method isn't a particulalty computationally efficient way of getting the course templates, but it will do for now until we can get around to making an improved version
'''

import json
import os
import boto3
from boto3.dynamodb.conditions import Attr

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


def get_list_of_templates(event, context):



    claims = event["requestContext"]["authorizer"]["claims"]
    calling_user_email = claims.get("email")

    statusCode = 0
    output_body =       ""



    try:
        #first we verify if the calling user has either the Teacher or Admin role 
        caller_user_row =  table.get_item(Key= {"ID": "USER#" + calling_user_email}).get("Item")
        user_roles = caller_user_row.get("Roles", [])

        if not ("Admin" in user_roles) and not ("Teacher" in user_roles):
            statusCode = 403
            output_body = "Error: You do not have permission to view template details"
            return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }
        
        templates_response = table.scan(
            FilterExpression=Attr("ID").begins_with("COURSE_TEMPLATE#")
        )

        templates = templates_response["Items"]

        for i in range(len(templates)):
            templates[i] = normalize_string_sets(templates[i])


        output_body = templates
        statusCode = 200
        print(output_body)

    except:
        statusCode = 500
        output_body = "Error reading data from the table."


    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)
    }