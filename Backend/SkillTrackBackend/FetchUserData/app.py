import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}

def lambda_handler(event, context):


    ##Attempt to fetch row for the user that called this function
    claims = event["requestContext"]["authorizer"]["claims"]
    email = claims.get("email")
    
    statusCode = 0
    body =       ""    

    #####################################################
    try:
    # Fetch an item by primary key, the email
        response = table.get_item(
            Key= {
                "ID": "USER#" +email
            }
        )
        
        item = response.get("Item")

        #If the item is NOT found that means that we don't have a row for this user yet, let's generate one now
        if not item:            
            #try generating the item
            try:
                item ={
                    "ID": "USER#"+email,
                    "FirstName": None,
                    "LastName": None,
                    "Roles": ["Student"],
                    "Years":  
                    [
                        {
                            "Year": '1',
                            "Courses":[
                            {
                                "CourseName":  "NRS 210: Foundations of Nursing Health Promotion",
                                "Skills": {"Handwashing - Infection Prevention": True, "PPE - Infection Prevention": False, "WIP addmore": False }
                            },
                            {
                                "CourseName":  "NRS 230: Pharmacology I",
                                "Skills": {"IM - Medical Admin &...": False, "IV- Medical Admin...": True}
                            }
                            ]
                        }
                    ]
                }
                table.put_item(Item =item)
                statusCode = 201
                body = item
            
            except Exception as e:
                statusCode = 500
                body = "Data for user not found, and failed to create new data entry for user."
        #case where the item is found, we simply return sucessful status code, and fetched data
        else:
            statusCode = 200
            body = item
    except:
        statusCode = 500
        body = "Failed to read data from the database"
    

    return {
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(body)
    }


