from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd
import plotly.express as px
import json
import psycopg2
from psycopg2 import sql

app = Flask(__name__)

# Load the model
model = pickle.load(open('model.pkl', 'rb'))

# Database connection parameters
DB_PARAMS = {
    'dbname': 'creditcompass',
    'user': 'postgres',
    'password': 'constella',
    'host': 'localhost',
    'port': '5432'
}

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        return psycopg2.connect(**DB_PARAMS)
    except psycopg2.Error as e:
        app.logger.error(f"Database connection error: {e}")
        raise

def create_plots(dataframes):
    """Generates Plotly plots from dataframes."""
    plots = {
        'purpose': px.bar(dataframes['purpose'], x='purpose', y='count', title='Top 10 Reasons for Seeking a Loan'),
        'loan_approval_time': px.line(dataframes['loan_approval_time'], x='issue_year', y='count', title='Loan Approvals Over Time'),
        'approval_by_state': px.bar(dataframes['approval_by_state'], x='state', y='count', title='Loan Approvals by State'),
        'income_loan_ratio': px.pie(dataframes['income_loan_ratio'], names='status', values='mean_ratio', hole=0.6, title='Income to Loan Ratio by Loan Status'),
        'interest_rate_time': px.area(dataframes['interest_rate_time'], x='issue_year', y='avg_rate', title='Average Interest Rate Over Time'),
        'employee_titles': px.bar(dataframes['employee_titles'], x='title', y='count', title='Top 10 Employee Titles')
    }
    # Update plot axes and titles
    for key, fig in plots.items():
        if key in ['purpose', 'approval_by_state', 'employee_titles']:
            fig.update_xaxes(title_text='Category')
            fig.update_yaxes(title_text='Count')
        elif key == 'loan_approval_time':
            fig.update_xaxes(title_text='Year')
            fig.update_yaxes(title_text='Count')
        elif key == 'income_loan_ratio':
            fig.update_traces(textposition='inside', textinfo='percent+label')
        elif key == 'interest_rate_time':
            fig.update_xaxes(title_text='Year')
            fig.update_yaxes(title_text='Average Interest Rate')
    return {key: fig.to_json() for key, fig in plots.items()}

@app.route('/')
def home():
    """Renders the homepage with initial data and plots."""
    try:
        conn = get_db_connection()
        queries = {
            'purpose': 'SELECT purpose, COUNT(*) as count FROM loans GROUP BY purpose ORDER BY count DESC LIMIT 10',
            'loan_approval_time': 'SELECT issue_year, COUNT(*) as count FROM loans GROUP BY issue_year ORDER BY issue_year',
            'approval_by_state': "SELECT addr_state as state, COUNT(*) as count FROM loans WHERE loan_status='Paid' GROUP BY addr_state ORDER BY count DESC",
            'income_loan_ratio': 'SELECT loan_status as status, AVG(income_to_loan_ratio) as mean_ratio FROM loans GROUP BY loan_status',
            'interest_rate_time': 'SELECT issue_year, AVG(int_rate) as avg_rate FROM loans GROUP BY issue_year',
            'employee_titles': 'SELECT emp_title as title, COUNT(*) as count FROM loans GROUP BY emp_title ORDER BY count DESC LIMIT 10'
        }
        dataframes = {key: pd.read_sql(query, conn) for key, query in queries.items()}
        conn.close()

        # Create plots
        graphJSON = create_plots(dataframes)

        # Load the GeoJSON data for the map
        with open('static/us-states-updated.json') as f:
            states_geojson = json.load(f)

        return render_template('index.html', graphJSON=graphJSON, states_geojson=states_geojson)
    except Exception as e:
        app.logger.error(f"Error in home route: {e}")
        return f"An error occurred: {e}", 500

@app.route('/initial_data')
def initial_data():
    """Returns initial data for visualization plots."""
    try:
        conn = get_db_connection()
        df_queries = {
            'df_purpose': 'SELECT purpose, COUNT(*) as count FROM loans GROUP BY purpose ORDER BY count DESC LIMIT 10',
            'df_loan_approval_time': 'SELECT issue_year, COUNT(*) as count FROM loans GROUP BY issue_year ORDER BY issue_year',
            'df_approval_by_state': "SELECT addr_state as state, COUNT(*) as count FROM loans WHERE loan_status='Paid' GROUP BY addr_state ORDER BY count DESC",
            'df_income_loan_ratio': 'SELECT loan_status as status, AVG(income_to_loan_ratio) as mean_ratio FROM loans GROUP BY loan_status',
            'df_interest_rate_time': 'SELECT issue_year, AVG(int_rate) as avg_rate FROM loans GROUP BY issue_year',
            'df_employee_titles': 'SELECT emp_title as title, COUNT(*) as count FROM loans GROUP BY emp_title ORDER BY count DESC LIMIT 10'
        }
        dataframes = {name: pd.read_sql(query, conn) for name, query in df_queries.items()}
        conn.close()

        # Prepare data for plots
        data = {
            'plot1': {
                'data': [{
                    'x': dataframes['df_purpose']['purpose'].tolist(),
                    'y': dataframes['df_purpose']['count'].tolist(),
                    'type': 'bar'
                }],
                'layout': {'title': 'Top 10 Reasons for Seeking a Loan'}
            },
            'plot2': {
                'data': [{
                    'x': dataframes['df_loan_approval_time']['issue_year'].tolist(),
                    'y': dataframes['df_loan_approval_time']['count'].tolist(),
                    'type': 'line'
                }],
                'layout': {'title': 'Loan Approvals Over Time'}
            },
            'plot3': {
                'data': [{
                    'x': dataframes['df_approval_by_state']['state'].tolist(),
                    'y': dataframes['df_approval_by_state']['count'].tolist(),
                    'type': 'bar'
                }],
                'layout': {'title': 'Loan Approvals by State'}
            },
            'plot4': {
                'data': [{
                    'labels': dataframes['df_income_loan_ratio']['status'].tolist(),
                    'values': dataframes['df_income_loan_ratio']['mean_ratio'].tolist(),
                    'type': 'pie'
                }],
                'layout': {'title': 'Income to Loan Ratio by Loan Status'}
            },
            'plot5': {
                'data': [{
                    'x': dataframes['df_interest_rate_time']['issue_year'].tolist(),
                    'y': dataframes['df_interest_rate_time']['avg_rate'].tolist(),
                    'type': 'line'
                }],
                'layout': {'title': 'Average Interest Rate Over Time'}
            },
            'plot6': {
                'data': [{
                    'x': dataframes['df_employee_titles']['title'].tolist(),
                    'y': dataframes['df_employee_titles']['count'].tolist(),
                    'type': 'bar'
                }],
                'layout': {'title': 'Top 10 Employee Titles'}
            }
        }

        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Error in initial_data route: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/filter_data')
def filter_data():
    """Filters data based on query parameters and returns plot data."""
    year = request.args.get('year')
    state = request.args.get('state')
    loan_status = request.args.get('loan_status')
    
    try:
        conn = get_db_connection()
        
        # Start with base query
        query = sql.SQL('SELECT * FROM loans WHERE TRUE')
        params = []

        # Append conditions based on filters
        if year:
            query += sql.SQL(' AND issue_year = %s')
            params.append(year)
        if state:
            query += sql.SQL(' AND addr_state = %s')
            params.append(state)
        if loan_status:
            query += sql.SQL(' AND loan_status = %s')
            params.append(loan_status)

        df_filtered = pd.read_sql(query, conn, params=params)
        conn.close()

        # Generate data for plots
        data = {
            'plot1': {
                'data': [{
                    'x': df_filtered['purpose'].value_counts().index.tolist(),
                    'y': df_filtered['purpose'].value_counts().tolist(),
                    'type': 'bar'
                }],
                'layout': {'title': 'Top Reasons for Seeking a Loan'}
            },
            'plot2': {
                'data': [{
                    'x': df_filtered['issue_year'].value_counts().index.tolist(),
                    'y': df_filtered['issue_year'].value_counts().tolist(),
                    'type': 'line'
                }],
                'layout': {'title': 'Loan Approvals Over Time (Filtered)'}
            },
            'plot3': {
                'data': [{
                    'x': df_filtered['issue_year'].value_counts().index.tolist(),
                    'y': df_filtered['issue_year'].value_counts().tolist(),
                    'type': 'line'
                }],
                'layout': {'title': 'Loan Approvals Over Time (Filtered)'}
            },
            'plot4': {
                'data': [{
                    'x': df_filtered['issue_year'].value_counts().index.tolist(),
                    'y': df_filtered['issue_year'].value_counts().tolist(),
                    'type': 'line'
                }],
                'layout': {'title': 'Loan Approvals Over Time (Filtered)'}
            },
            'plot5': {
                'data': [{
                    'x': df_filtered['issue_year'].value_counts().index.tolist(),
                    'y': df_filtered['issue_year'].value_counts().tolist(),
                    'type': 'line'
                }],
                'layout': {'title': 'Loan Approvals Over Time (Filtered)'}
            },
            'plot6': {
                'data': [{
                    'x': df_filtered['issue_year'].value_counts().index.tolist(),
                    'y': df_filtered['issue_year'].value_counts().tolist(),
                    'type': 'line'
                }],
                'layout': {'title': 'Loan Approvals Over Time (Filtered)'}
            }
            # Add more plots if needed
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/dropdown_options')
def dropdown_options():
    """Returns unique options for dropdown menus."""
    try:
        conn = get_db_connection()
        
        # Execute queries to fetch distinct values
        years_query = 'SELECT DISTINCT issue_year FROM loans ORDER BY issue_year'
        states_query = 'SELECT DISTINCT addr_state FROM loans ORDER BY addr_state'
        loan_statuses_query = 'SELECT DISTINCT loan_status FROM loans ORDER BY loan_status'

        # Load data into DataFrames
        df_years = pd.read_sql(years_query, conn)
        df_states = pd.read_sql(states_query, conn)
        df_loan_statuses = pd.read_sql(loan_statuses_query, conn)

        # Close the connection
        conn.close()

        # Extract options from DataFrames
        options = {
            'years': df_years['issue_year'].tolist(),
            'states': df_states['addr_state'].tolist(),
            'loan_statuses': df_loan_statuses['loan_status'].tolist()
        }

        return jsonify(options)
    except Exception as e:
        # Log the error for debugging
        app.logger.error(f"Error fetching dropdown options: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500


def preprocess_and_align(df, expected_columns):
    """Preprocesses and aligns the DataFrame to match the model's expected input."""
    # Convert categorical fields to dummy variables
    categorical_columns = ['term', 'purpose', 'grade', 'home_ownership', 'addr_state']
    df = pd.get_dummies(df, columns=categorical_columns, drop_first=True)

    # Ensure the DataFrame has the same columns as the model expects
    for column in expected_columns:
        if column not in df.columns:
            df[column] = 0
    df = df[expected_columns]
    
    return df

@app.route('/loan', methods=['GET', 'POST'])
def loan():
    """Handles the loan request form."""
    if request.method == 'POST':
        # Collect form data
        data = {
            'loan_amnt': [float(request.form['loan_amnt'])],
            'term': [request.form['term']],
            'int_rate': [float(request.form['int_rate'])],
            'installment': [float(request.form['installment'])],
            'emp_length': [float(request.form['emp_length'])],
            'annual_inc': [float(request.form['annual_inc'])],
            'delinq_2yrs': [float(request.form['delinq_2yrs'])],
            'open_acc': [float(request.form['open_acc'])],
            'pub_rec': [float(request.form['pub_rec'])],
            'mort_acc': [float(request.form['mort_acc'])],
            'home_ownership': [request.form['home_ownership']],
            'addr_state': [request.form['addr_state']],
            'purpose': [request.form['purpose']],
            'grade': [request.form['grade']],
            'dti': [float(request.form['dti'])]
        }

        # Define expected columns
        expected_columns = [
            'loan_amnt', 'term', 'int_rate', 'installment', 'emp_length', 'annual_inc', 'delinq_2yrs',
            'open_acc', 'pub_rec', 'mort_acc', 'home_ownership', 'addr_state', 'purpose', 'grade', 'dti'
        ]
        
        try:
            # Convert data to DataFrame for prediction
            df = pd.DataFrame(data)
            
            # Preprocess and align DataFrame
            prepared_df = preprocess_and_align(df, expected_columns)
            
            # Make prediction
            prediction = model.predict(prepared_df)[0]
            prediction_proba = model.predict_proba(prepared_df)[0].tolist()  # Convert numpy array to list
            
            return jsonify({
                'approval_prediction': int(prediction),
                'prediction_probabilities': prediction_proba
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return render_template('loan.html')

app = Flask(__name__)

# Ensure your model is loaded here
# model = load_your_model()

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    """Handles prediction requests."""
    if request.method == 'POST':
        data = {
            'loan_amnt': [float(request.form['loan_amnt'])],
            'term': [request.form['term']],
            'int_rate': [float(request.form['int_rate'])],
            'installment': [float(request.form['installment'])],
            'emp_length': [float(request.form['emp_length'])],
            'annual_inc': [float(request.form['annual_inc'])],
            'delinq_2yrs': [float(request.form['delinq_2yrs'])],
            'open_acc': [float(request.form['open_acc'])],
            'pub_rec': [float(request.form['pub_rec'])],
            'mort_acc': [float(request.form['mort_acc'])],
            'home_ownership': [request.form['home_ownership']],
            'addr_state': [request.form['addr_state']],
            'purpose': [request.form['purpose']],
            'grade': [request.form['grade']],
            'dti': [float(request.form['dti'])]
        }

        expected_columns = [
            'loan_amnt', 'term', 'int_rate', 'installment', 'emp_length', 'annual_inc', 'delinq_2yrs',
            'open_acc', 'pub_rec', 'mort_acc', 'home_ownership', 'addr_state', 'purpose', 'grade', 'dti'
        ]

        try:
            df = pd.DataFrame(data)
            prepared_df = preprocess_and_align(df, expected_columns)
            prediction = model.predict(prepared_df)[0]
            prediction_proba = model.predict_proba(prepared_df)[0].tolist()
            
            return jsonify({
                'approval_prediction': int(prediction),
                'prediction_probabilities': prediction_proba
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return render_template('loan.html')

if __name__ == '__main__':
    app.run(debug=True)