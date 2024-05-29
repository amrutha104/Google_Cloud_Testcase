const { ConfigServiceClient, DescribeConfigRulesCommand } = require("@aws-sdk/client-config-service");

const region = 'us-west-2'; // Change the region if required

const tagkey = 'BucketACL';
const tagvalue = 'Prohibited';
const configrulename = 'Practice';
const validationResult = [
        { weightage: 0, name: "ConfigRule is named as 'Practice'", status: false, error: '' },
        { weightage: 0, name: "Assigned ConfigRule is 'S3_BUCKET_ACL_PROHIBITED'", status: false, error: '' },
        { weightage: 0, name: "Assigned scope of the ConfigRule has mentioned tag", status: false, error: '' },
    ];

async function validateAWSConfigRules() {
    try {
        const configService = new ConfigServiceClient({ region,credentials });
        const { ConfigRules: [testUserRule] } = await configService.send(new DescribeConfigRulesCommand({ ConfigRuleNames: [configrulename] }));

        if (testUserRule) {
            validationResult[0].weightage = 0.25;
            validationResult[0].status = true;
        } else {
            validationResult[0].error = "ConfigRule 'Practice' not found.";
        }

        try {
            if (testUserRule && testUserRule.Source.SourceIdentifier === 'S3_BUCKET_ACL_PROHIBITED') {
                validationResult[1].weightage = 0.25;
                validationResult[1].status = true;
            } else {
                validationResult[1].error = "Assigned ConfigRule is not 'S3_BUCKET_ACL_PROHIBITED'.";
            }
        } catch (error) {
            validationResult[1].error = "Assigned ConfigRule is not 'S3_BUCKET_ACL_PROHIBITED'.";
        }

        try {
            if (testUserRule && testUserRule.Scope) {
                const scopeExists = testUserRule.Scope.TagKey === tagkey &&
                    testUserRule.Scope.TagValue === tagvalue;
                if (scopeExists) {
                    validationResult[2].weightage = 0.5;
                    validationResult[2].status = true;
                } else {
                    validationResult[2].error = "ConfigRule does not have the expected scope.";
                }
            } else {
                validationResult[2].error = "Scope information for ConfigRule is not available.";
            }
        } catch (error) {
            validationResult[2].error = "Scope information for ConfigRule is not available.";
        }

        return validationResult;
    } catch (error) {
        // Update error handling to display only errors for failed test cases
        validationResult.forEach((condition, index) => {
            if (!condition.status) {
                validationResult[index].error = error.message;
            }
        });
        return validationResult;
    }
}

async function main() {
    const result = await validateAWSConfigRules();
    console.log(result);
    return result;
}

main();
