import json

# import requests

import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):
    """Sample pure Lambda function

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

        Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict

        Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """

    # try:
    #     ip = requests.get("http://checkip.amazonaws.com/")
    # except requests.RequestException as e:
    #     # Send some context about this error to Lambda Logs
    #     print(e)

    #     raise e



    ##here let's attempt to gtab stuff rom the table!
    ########################
    try:
        # Fetch an item by primary key (HASH key)
        response = table.get_item(
            Key={
                "ID": "User100"   # <-- Replace with the actual key value you want
            }
        )

        item = response.get("Item")
        statusCode = 0
        body =       ""

        if not item:
            statusCode = 404
            body = "Item not found"
        else:
            statusCode = 200
            body = str(item)


    except Exception as e:
        print("Error fetching item:", e)
        
        statusCode = 500
        body = "Internal Server Error"


    ##########################


    return {
        "statusCode": statusCode,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },       
        "body": json.dumps({
            "message": body,
            # "location": ip.text.replace("\n", "")
        }),
    }




    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },       
        "body": json.dumps({
            "message": "hello world!",
            # "location": ip.text.replace("\n", "")
        }),
    }
