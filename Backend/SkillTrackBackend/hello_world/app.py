import json

# import requests

import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):

    mock_data ={
        "Email": "test@gmail.com",
        "FirstName": "John",
        "LastName": "Doe",
        "Roles": ["Student"],
        "years": [
            {
                "Year": 1,
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


    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },       
        "body": json.dumps(mock_data)
    }
