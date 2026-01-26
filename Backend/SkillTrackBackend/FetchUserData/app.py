'''
/FetchUserData Function definition

GET, not inputs besides authorization required

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

        #If the item is NOT found that means that we don't have a row for this user yet, let's generate one now
        #This is a temporary measure just so we have data in place, later this will be elimated
        if not item:            
            try:
                item ={
                    "ID": "USER#"+email,
                    "FirstName": None,
                    "LastName": None,
                    "Roles": {"Student"},
                    "Courses": {
                        "NRS-210-2020":{
                            "CourseName": "NRS 210: Foundations of Nursing Health Promotion",
                            "Skills":{
                                "Handwashing - Infection Prevention": True,
                                "PPE - Infection Prevention": False                                        
                            }
                        },
                        "NRS-230-2020":{
                            "CourseName":  "NRS 230: Pharmacology I",
                            "Skills": {"IM - Medical Admin &...": False, "IV- Medical Admin...": True}
                        }
                    }
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

            #python does not like the string set for some reason when calling json.dumps(), so use this function to turn any string sets as a list.      
            normalized_item = normalize_string_sets(item)            
            body = normalized_item
    except:
        #reach this except if we failed to find item and failed to create one
        statusCode = 500
        body = "Failed to read data from the database"
    
    #return code based on what happened.
    return {
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(body)
    }


