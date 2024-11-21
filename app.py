from flask import Flask, render_template, request, redirect, url_for
from optimize import run_optimization, build_production_plan_table, build_transport_plan_table

app = Flask(__name__)

# Step 1: Define Network Structure
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # Get the network structure from the form
        num_products = int(request.form['num_products'])
        num_factories = int(request.form['num_factories'])
        num_warehouses = int(request.form['num_warehouses'])
        num_customers = int(request.form['num_customers'])

        # Redirect to step 2 with the network structure data
        return redirect(url_for('step2', num_products=num_products, num_factories=num_factories,
                                num_warehouses=num_warehouses, num_customers=num_customers))
    return render_template("index.html")


# Step 2: Enter Data for Optimization
@app.route("/step2", methods=["GET", "POST"])
def step2():
    if request.method == "POST":
        # Extract input data for optimization
        num_products = int(request.form['num_products'])
        num_factories = int(request.form['num_factories'])
        num_warehouses = int(request.form['num_warehouses'])
        num_customers = int(request.form['num_customers'])

        # Collect other form data for optimization
        inventory_pf = {}
        inventory_pw = {}
        production_capacity = []
        storage_capacity = []
        production_cost = []
        storage_cost = []
        transportation_cost_fw = {}
        transportation_cost_fc = {}
        transportation_cost_wc = {}
        demand = {}

        # Parse the submitted form data
        for p in range(num_products):
            for f in range(num_factories):
                inventory_pf[(p, f)] = int(request.form[f'starting_inventory_pf_{p}_{f}'])

        for p in range(num_products):
            for w in range(num_warehouses):
                inventory_pw[(p, w)] = int(request.form[f'starting_inventory_pw_{p}_{w}'])

        for f in range(num_factories):
            production_capacity.append(int(request.form[f'production_capacity_{f}']))
            production_cost.append(int(request.form[f'production_cost_{f}']))

        for w in range(num_warehouses):
            storage_capacity.append(int(request.form[f'storage_capacity_{w}']))
            storage_cost.append(int(request.form[f'storage_cost_{w}']))

        for f in range(num_factories):
            for w in range(num_warehouses):
                transportation_cost_fw[(f, w)] = int(request.form[f'trans_cost_fw_{f}_{w}'])

        for f in range(num_factories):
            for c in range(num_customers):
                transportation_cost_fc[(f, c)] = int(request.form[f'trans_cost_fc_{f}_{c}'])

        for w in range(num_warehouses):
            for c in range(num_customers):
                transportation_cost_wc[(w, c)] = int(request.form[f'trans_cost_wc_{w}_{c}'])

        for p in range(num_products):
            for c in range(num_customers):
                demand[(p, c)] = int(request.form[f'demand_{p}_{c}'])

        # Run optimization
        result = run_optimization(num_products, num_factories, num_warehouses, num_customers, 
                                  inventory_pf, inventory_pw, production_capacity, storage_capacity, 
                                  production_cost, storage_cost, transportation_cost_fw, 
                                  transportation_cost_fc, transportation_cost_wc, demand)

        # Render the result page
        return render_template("result.html", result=result, num_products=num_products, 
                               num_factories=num_factories, num_warehouses=num_warehouses, 
                               num_customers=num_customers,
                               build_production_plan_table=build_production_plan_table,
                               build_transport_plan_table=build_transport_plan_table)

    # Show the form for entering data
    num_products = int(request.args.get('num_products'))
    num_factories = int(request.args.get('num_factories'))
    num_warehouses = int(request.args.get('num_warehouses'))
    num_customers = int(request.args.get('num_customers'))
    return render_template("step2.html", num_products=num_products, num_factories=num_factories, 
                           num_warehouses=num_warehouses, num_customers=num_customers)


# Run the optimization process and display the result
@app.route("/optimize", methods=["POST"])
def optimize():
    # Extract the data passed from the form
    num_products = int(request.form['num_products'])
    num_factories = int(request.form['num_factories'])
    num_warehouses = int(request.form['num_warehouses'])
    num_customers = int(request.form['num_customers'])

    # Collect form data (This section should match your form structure in step2.html)
    inventory_pf = {}
    inventory_pw = {}
    production_capacity = []
    storage_capacity = []
    production_cost = []
    storage_cost = []
    transportation_cost_fw = {}
    transportation_cost_fc = {}
    transportation_cost_wc = {}
    demand = {}

    for p in range(num_products):
        for f in range(num_factories):
            inventory_pf[(p, f)] = int(request.form[f'starting_inventory_pf_{p}_{f}'])

    for p in range(num_products):
        for w in range(num_warehouses):
            inventory_pw[(p, w)] = int(request.form[f'starting_inventory_pw_{p}_{w}'])

    for f in range(num_factories):
        production_capacity.append(int(request.form[f'production_capacity_{f}']))
        production_cost.append(int(request.form[f'production_cost_{f}']))

    for w in range(num_warehouses):
        storage_capacity.append(int(request.form[f'storage_capacity_{w}']))
        storage_cost.append(int(request.form[f'storage_cost_{w}']))

    for f in range(num_factories):
        for w in range(num_warehouses):
            transportation_cost_fw[(f, w)] = int(request.form[f'trans_cost_fw_{f}_{w}'])

    for f in range(num_factories):
        for c in range(num_customers):
            transportation_cost_fc[(f, c)] = int(request.form[f'trans_cost_fc_{f}_{c}'])

    for w in range(num_warehouses):
        for c in range(num_customers):
            transportation_cost_wc[(w, c)] = int(request.form[f'trans_cost_wc_{w}_{c}'])

    for p in range(num_products):
        for c in range(num_customers):
            demand[(p, c)] = int(request.form[f'demand_{p}_{c}'])

    # Call the optimization logic from optimize.py
    result = run_optimization(num_products, num_factories, num_warehouses, num_customers, 
                              inventory_pf, inventory_pw, production_capacity, storage_capacity, 
                              production_cost, storage_cost, transportation_cost_fw, 
                              transportation_cost_fc, transportation_cost_wc, demand)

    # Render the result page
    return render_template("result.html", result=result, num_products=num_products, 
                           num_factories=num_factories, num_warehouses=num_warehouses, 
                           num_customers=num_customers,
                           build_production_plan_table=build_production_plan_table,
                           build_transport_plan_table=build_transport_plan_table)

if __name__ == "__main__":
    app.run(debug=True)
