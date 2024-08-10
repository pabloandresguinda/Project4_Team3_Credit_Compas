# Project4_Team3_Credit_Compas

# 1. Problem Ideation and Proposal

## The Problem Statement

- The approval of loans is a critical aspect of financial services, and understanding the factors that influence loan approval rates can help financial institutions make more informed decisions.
- Despite the availability of extensive applicant data, predicting loan approval remains a complex task due to the many variables involved.
- This project aims to develop a machine learning model that accurately predicts loan approval based on various applicant attributes.
- By analyzing temporal trends, demographic and economic patterns, income ratios, and geographical differences, we seek to uncover insights that can improve the loan approval process and enhance the fairness and efficiency of lending decisions.

# Objective
* To create a machine learning model that predicts loan approval based on various applicant attributes

## Specific Objectives:

1. **Temporal Analysis**: How do loan approval rates change over time?
    * Data Required: `issue_d`
    * _Approach_: Perform a trend analysis using the `issue_d` column to observe changes in loan approval rates over different periods.

2. **Demographic Influence**: Are there demographic and economic patterns (e.g., `employment title`, `length`, `home ownership status`, `interest rate`) that influence loan approval rates?
    * Data Required: `emp_title`, `emp_length`, `home_ownership`
    * _Approach_: Analyze the influence of `employment title`, `employment length`, and `home ownership status` on loan approval rates.

3. **Income Analysis**: How does the ratio of applicant income to loan amount influence loan approval likelihood?
    * Data Required: `annual_inc`, `loan_amnt`
    * _Approach_: Calculate the `income-to-loan ratio` and analyze its impact on loan approval likelihood.

4. **Geographical Trends**: Are there significant differences in loan approval rates across different states?
    * Data Required: `zip_code`, `addr_state`
    * _Approach_: Analyze loan approval rates based on geographical locations using `zip_code` and `addr_state`.
  
# 2. Data Collection and Preparation
* Load the dataset, handle missing values, and perform initial preprocessing.

# 3. Exploratory Data Analysis (EDA)
* Explore the data to identify trends, patterns, and relationships among variables.

# 4. Feature Selection and Engineering
* Select and engineer relevant features based on EDA insights and properly encoding categorical variables.

# 5. Model Building, Training and Evaluation
* Train different models using the selected features (keeping in mind the target/outcome variable is binary)

# 6. Evaluate and Compare the Models
* Evaluate the performance of the models using various metrics

# 7. Conclusion and Insights
* Summarize findings and implications

# 8. Saving the Best Model
* Ensure you have joblib installed
