# <font color = "green">Credit Compass</font>

![logo](https://github.com/user-attachments/assets/27a71061-dca7-4807-bd27-e26edfef2ca0)


# Loan Approval Prediction Project

## Project Overview

This project aims to develop a machine learning model to predict loan approval based on various applicant attributes. By analyzing temporal trends, demographic and economic patterns, income ratios, and geographical differences, the project seeks to enhance the fairness and efficiency of lending decisions.

### Objective
To create a machine learning model that predicts loan approval based on various applicant attributes.

### Specific Objectives:

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

## List of Contributors
- Rudi Espinoza
- Maero Lutta
- Pablo Guinda
- Diana Tarasovers
- Eunice Mwangi

## Data Sources
- **Primary Data**: Kaggle Lending Club Data downloaded from [Kaggle](https://www.kaggle.com/datasets/wordsforthewise/lending-club)
- **Geographical Data**: [`us-states.json`](https://www.kaggle.com/datasets/pompelmo/usa-states-geojson) file

## Tools and Technologies
- **Development Environment**: Jupyter Notebook, VS Code
- **Languages and Libraries**: Python, Pandas, Matplotlib, Seaborn, Plotly, XGBoost, scikit-learn
- **Data Handling**: JSON, CSV, PostgreSQL
- **Web Framework**: Flask
- **Visualization**: Leaflet, D3.js

## Data Management
- **Data Cleaning**: Removal of missing or irrelevant data.
- **Normalization & Standardization**: Scaling features to ensure uniformity.
- **Feature Engineering**: Identification and creation of critical features.

### 1. Data Collection and Preparation
- **Import libraries**
- **Load the dataset**

![image](https://github.com/user-attachments/assets/ab247721-2fa3-4c59-8085-eceec12f3190)


- **Data Cleaning**: remove unwanted data, handle missing values, and perform initial preprocessing.

### 2. Exploratory Data Analysis (EDA)
* Explore the data to identify trends, patterns, and relationships among variables.

![image](https://github.com/user-attachments/assets/6fb5746c-3790-4825-9c5b-91e87a39cdb9)

* Selected features and the target variable were saved into an SQL database in Postgre

![image](https://github.com/user-attachments/assets/dfa43087-8d0d-4ce9-9b1f-1260cc41be0d)


### 3. Feature Selection and Engineering
* Select and engineer relevant features based on EDA insights and properly encode categorical variables.
* Using the Random Forest Classifier we extracted important features

![image](https://github.com/user-attachments/assets/86671c1a-477a-4b9a-bd66-54339e2a58cb)
#### Feature Importance
  1. `int_rate`: 0.158708
  2. `dti`: 0.135081
  3. `income_to_loan_ratio`: 0.118495
  4. `installment`: 0.117501
  5. `annual_inc`: 0.101025
  6. `addr_state`: 0.088280
  7. `loan_amnt`: 0.072905
  8. `emp_length`: 0.052212
  9. `purpose`: 0.031595
  10. `mort_acc`: 0.028045
  11. `term`: 0.027703
  12. `delinq_2yrs`: 0.021732
  13. `grade`: 0.016636
  14. `home_ownership`: 0.015951
  15. `pub_rec`: 0.014133

### 4. Model Building, Training and Evaluation
* Train different models using the selected features
  * We considered that our target variable is binary including running robust models.
  * Five models were built, trained and evaluated in total.

### 5. Evaluate and Compare the Models
* Evaluate the performance of the models using various metrics
* Here we used the confusion matrix, plotted Receiver Operating Characteristic Curves for each model and determined the area under the curve (AUC).
  * The performance of the models was as follows:
    - **Logistic Regression**: Accuracy = 0.5994
    - **Decision Tree**: Accuracy = 0.6527
    - **Random Forest**: Accuracy = 0.6883
    - **Gradient Boosting**: Accuracy = 0.6816
    - **XGBoost**: Accuracy = 0.7296 (Best Model) and had an **ROC AUC**: 0.81
   
  ![image](https://github.com/user-attachments/assets/0c998594-d463-4965-a543-4b92bbde06f1)

  
  ![image](https://github.com/user-attachments/assets/7e6f6558-a670-4e9d-a157-1894c26e52b7)



### 6. Model Tuning and Hyperparameter Tuning
* A model with fewer important features was tested but did not outperform the robust model `Credit Compact few Features.ipynb`.
* Additional hyperparameter tuning models were considered.
  
### 7. Conclusion and Insights
* Summarize findings and implications.
  
#### Key Results
- **Best Models**: XGBoost and Random Forest exhibited the highest accuracy and ROC AUC scores, effectively capturing patterns in loan approval data.
- **Significant Predictors**:
  - Interest rate, debt-to-income ratio, income-to-loan ratio, instalment capability, and annual income.
  - Geographical trends and employment length also impacted loan approval.
  - Home ownership status showed relevance in loan approval likelihood.
- **Model Insights**: Ensemble methods (Random Forest, XGBoost) were effective for handling complex datasets. Models with fewer features performed worse compared to those with more comprehensive feature sets.


### 8. Saving the Best Model
* Ensure you have `joblib` installed.

### 9. Implementing the Model from the Notebook
```python
# import libraries
import pandas as pd
import joblib

# Load the pre-trained model
model = joblib.load('./loan_app/model.pkl')

def preprocess_and_align(df, expected_columns):
    # Convert categorical fields to dummy variables
    categorical_columns = ['term', 'purpose', 'grade', 'home_ownership', 'addr_state']
    df = pd.get_dummies(df, columns=categorical_columns, drop_first=True)

    # Ensure the DataFrame has the same columns as the model expects
    for column in expected_columns:
        if column not in df.columns:
            df[column] = 0
    df = df[expected_columns]
    
    return df

# Define expected columns
expected_columns = ['loan_amnt', 'term', 'int_rate', 'installment', 'emp_length', 'annual_inc', 'delinq_2yrs',
                    'open_acc', 'pub_rec', 'mort_acc', 'home_ownership', 'addr_state', 'purpose', 'grade' , 'dti']

# Sample input data
data = {
    'loan_amnt': [5000],
    'term': ['36 months'],
    'int_rate': [10.0],
    'installment': [100],
    'emp_length': [5],
    'annual_inc': [60000],
    'delinq_2yrs': [0],
    'open_acc': [5],
    'pub_rec': [0],
    'mort_acc': [1],
    'home_ownership': ['rent'],
    'addr_state': ['CA'],
    'purpose': ['car'],
    'grade': ['B'],
    'dti': [1.2]
}

# Create DataFrame
df = pd.DataFrame(data)

# Preprocess and align DataFrame
prepared_df = preprocess_and_align(df, expected_columns)

# Predict using the model
prediction = model.predict(prepared_df)
prediction_proba = model.predict_proba(prepared_df)

print("Prediction:", prediction)
print("Prediction Probabilities:", prediction_proba)

```

### 10. Implementing the Model in Real Life 
* We chose to do this through a web app developed in:
  * `HTML`, `CSS`, `JavaScript` and `JQuery`, `D3`, `Leaflet`, `SQL` used `Postgres` and deployed in `Flask`
  * The app has:
    * a landing page `index.html` which provides a background of Credit Compass,
      * a map with different layers of clients and a summary of loan details by state
![image](https://github.com/user-attachments/assets/ecc0b4a9-4a99-419f-8e62-d54658f2503e)
      * and a dashboard with a summary of background details regarding our clients and services between 2012 and 2018.
![image](https://github.com/user-attachments/assets/e3600ac3-a780-4d39-8fc0-b60c57ae716a)

    * a loan request page `loan.html` where a user can fill in background details (echoing the essential features in the model) and by submitting the form, receive a response on whether their loan application is approved or declined.
      ![image](https://github.com/user-attachments/assets/5c0c3115-b387-45ea-9194-a009568f479d)

   
# Setting up and Running the App        

## Steps to Set Up and Run the Flask App
# Setting Up and Running the Credit Compass Loan Approval Prediction App Locally

## Prerequisites

### Environment Setup:
1. **Python 3.10.13**: Ensure that you have Python 3.10.13 installed or other similar version. You can download it from [Python's official website](https://www.python.org/).
2. **VS Code**: Download and install Visual Studio Code from [here](https://code.visualstudio.com/).
3. **PostgreSQL**: Install PostgreSQL from [here](https://www.postgresql.org/download/).
4. **Git**: Install Git from [here](https://git-scm.com/downloads).
5. **Bash/Terminal**: Use the terminal integrated in VS Code or any other terminal of your choice.

### Kaggle Data Download:
1. Download the Lending Club dataset from Kaggle. You need to create a Kaggle account and use the API or manual download to obtain the dataset.

## Setting Up the Project

### Cloning the Project:
1. Clone the project repository using Git:
    ```bash
    git clone <repository_url>
    ```
2. Navigate to the project directory:
    ```bash
    cd <project_directory>
    ```

### Setting Up the Database:
1. Launch PostgreSQL and create a new database:
    ```sql
    CREATE DATABASE creditcompass;
    ```
2. Adjust the database credentials in the `Credit Compass.ipynb` notebook to match your PostgreSQL settings (username, password, host, and port).

### Installing Dependencies:
1. Install the required Python libraries by running the following command in your terminal:
    ```bash
    pip install pandas matplotlib seaborn plotly xgboost scikit-learn Flask joblib psycopg2-binary
    ```
2. Ensure you have `joblib` installed to save the model.

### Running the Jupyter Notebook:
1. Open `Credit Compass.ipynb` in Jupyter Notebook or JupyterLab.
2. Run the cells in the notebook to load the dataset, preprocess the data, perform EDA, train the models, and save the best model as `model.pkl`.

### Setting Up the Flask App:
1. Navigate to the `loan_app` directory in your terminal:
    ```bash
    cd loan_app
    ```
2. Run the Flask app using the command:
    ```bash
    python app.py
    ```
   This will start the Flask development server.

### Accessing the Web Application:
1. Open your web browser and go to `http://127.0.0.1:5000/` to access the web application.
2. The `index.html` page will display the homepage with plot visualizations.
3. Navigate to the `loan.html` page to input loan data and view prediction results.

## Project Structure
- **Credit Compass.ipynb**: Contains all data management steps, database creation, and model training.
- **Credit Compass few Features.ipynb**: Tests models with fewer features.
- **loan_app**: Contains the Flask app files (`app.py`, `model.pkl`, etc.).
- **templates**: Contains HTML templates for the web app.
- **static**: Contains static files such as CSS, images, and the `us-states.json` file.

## Tips
- Ensure the PostgreSQL service is running before creating the database.
- Keep your dataset and SQL credentials secure.
- Regularly commit your changes to Git for version control.
- Test the web application thoroughly to ensure it meets your requirements.

By following these steps, you can successfully set up and run the Credit Compass app locally on your computer.

   
