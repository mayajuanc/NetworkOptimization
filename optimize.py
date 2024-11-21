from pulp import LpMinimize, LpProblem, LpVariable, lpSum, LpStatus

def run_optimization(num_products, num_factories, num_warehouses, num_customers, 
                     inventory_pf, inventory_pw, production_capacity, storage_capacity, 
                     production_cost, storage_cost, transportation_cost_fw, 
                     transportation_cost_fc, transportation_cost_wc, demand):
    # Define the optimization problem
    problem = LpProblem("Supply_Chain_Optimization", LpMinimize)

    # Decision variables
    production = LpVariable.dicts("production", ((p, f) for p in range(num_products) for f in range(num_factories)), lowBound=0, cat='Continuous')
    transport_fw = LpVariable.dicts("transport_fw", ((f, w) for f in range(num_factories) for w in range(num_warehouses)), lowBound=0, cat='Continuous')
    transport_fc = LpVariable.dicts("transport_fc", ((f, c) for f in range(num_factories) for c in range(num_customers)), lowBound=0, cat='Continuous')
    transport_wc = LpVariable.dicts("transport_wc", ((w, c) for w in range(num_warehouses) for c in range(num_customers)), lowBound=0, cat='Continuous')

    # Objective function: Minimize total costs (production, storage, transportation)
    total_cost = lpSum([
        production_cost[f] * production[(p, f)] for p in range(num_products) for f in range(num_factories)
    ]) + lpSum([
        # Storage cost is calculated based on final inventory
        storage_cost[w] * (inventory_pw[(p, w)] + lpSum([transport_fw[(f, w)] for f in range(num_factories)]) - lpSum([transport_wc[(w, c)] for c in range(num_customers)]))
        for p in range(num_products) for w in range(num_warehouses)
    ]) + lpSum([
        transportation_cost_fw[(f, w)] * transport_fw[(f, w)] for f in range(num_factories) for w in range(num_warehouses)
    ]) + lpSum([
        transportation_cost_fc[(f, c)] * transport_fc[(f, c)] for f in range(num_factories) for c in range(num_customers)
    ]) + lpSum([
        transportation_cost_wc[(w, c)] * transport_wc[(w, c)] for w in range(num_warehouses) for c in range(num_customers)
    ])
    
    problem += total_cost

    # Constraints to ensure production is within factory capacity
    for f in range(num_factories):
        problem += lpSum([production[(p, f)] for p in range(num_products)]) <= production_capacity[f], f"Production_Capacity_{f}"

    # Constraints to ensure warehouse storage is within capacity
    for w in range(num_warehouses):
        problem += lpSum([inventory_pw[(p, w)] for p in range(num_products)]) <= storage_capacity[w], f"Storage_Capacity_{w}"

    # Demand fulfillment constraint: Meet all demand but respect available inventory and production limits
    for c in range(num_customers):
        for p in range(num_products):
            # Total shipped from factories and warehouses must meet the demand
            problem += lpSum([transport_fc[(f, c)] for f in range(num_factories)]) + lpSum([transport_wc[(w, c)] for w in range(num_warehouses)]) >= demand[(p, c)], f"Demand_Fulfillment_{p}_{c}"

    # Ensure that the total production and initial inventory at factories cannot deliver more than is available
    for p in range(num_products):
        for f in range(num_factories):
            total_shipped_from_factory = lpSum([transport_fw[(f, w)] for w in range(num_warehouses)]) + lpSum([transport_fc[(f, c)] for c in range(num_customers)])
            # Production plus initial inventory must be greater than or equal to what is shipped
            problem += production[(p, f)] + inventory_pf[(p, f)] >= total_shipped_from_factory, f"Factory_Inventory_Limit_{p}_{f}"

    # Ensure warehouses' final inventory is non-negative
    for p in range(num_products):
        for w in range(num_warehouses):
            total_received_from_factories = lpSum([transport_fw[(f, w)] for f in range(num_factories)])
            total_shipped_to_customers = lpSum([transport_wc[(w, c)] for c in range(num_customers)])
            # Initial inventory plus received goods must be greater than or equal to shipped goods
            problem += inventory_pw[(p, w)] + total_received_from_factories >= total_shipped_to_customers, f"Warehouse_Inventory_Limit_{p}_{w}"

    # New Constraint: Do not deliver more than the demand for each customer
    for p in range(num_products):
        for c in range(num_customers):
            # Total shipped to the customer should not exceed demand
            problem += lpSum([transport_fc[(f, c)] for f in range(num_factories)]) + lpSum([transport_wc[(w, c)] for w in range(num_warehouses)]) <= demand[(p, c)], f"Max_Demand_Constraint_{p}_{c}"

    # Solve the problem
    problem.solve()

    # Extract results
    result = {
        'status': LpStatus[problem.status],
        'total_cost': total_cost.value(),
        'total_production_cost': sum([production_cost[f] * production[(p, f)].value() for p in range(num_products) for f in range(num_factories)]),
        'total_storage_cost': sum([storage_cost[w] * (inventory_pw[(p, w)] + sum([transport_fw[(f, w)].value() for f in range(num_factories)]) - sum([transport_wc[(w, c)].value() for c in range(num_customers)])) for p in range(num_products) for w in range(num_warehouses)]),
        'total_transport_cost': sum([transportation_cost_fw[(f, w)] * transport_fw[(f, w)].value() for f in range(num_factories) for w in range(num_warehouses)]) +
                                sum([transportation_cost_fc[(f, c)] * transport_fc[(f, c)].value() for f in range(num_factories) for c in range(num_customers)]) +
                                sum([transportation_cost_wc[(w, c)] * transport_wc[(w, c)].value() for w in range(num_warehouses) for c in range(num_customers)]),
        'demand_fulfilled_percentage': 100 if all(demand[(p, c)] <= (lpSum([transport_fc[(f, c)].value() for f in range(num_factories)]) + lpSum([transport_wc[(w, c)].value() for w in range(num_warehouses)])) for p in range(num_products) for c in range(num_customers)) else 0,
        'production_plan': {(p, f): production[(p, f)].value() for p in range(num_products) for f in range(num_factories)},
        'transport_fw_summary': {(f, w): transport_fw[(f, w)].value() for f in range(num_factories) for w in range(num_warehouses)},
        'transport_fc_summary': {(f, c): transport_fc[(f, c)].value() for f in range(num_factories) for c in range(num_customers)},
        'transport_wc_summary': {(w, c): transport_wc[(w, c)].value() for w in range(num_warehouses) for c in range(num_customers)},
        'final_inventory': build_final_inventory_table(num_products, num_factories, num_warehouses, num_customers, production, inventory_pf, inventory_pw, transport_fw, transport_fc, transport_wc)
    }

    return result


def build_production_plan_table(result, num_products, num_factories):
    table = "<table border='1'>"
    table += "<thead><tr><th>Product</th>"
    for f in range(num_factories):
        table += f"<th>Factory {f+1}</th>"
    table += "<th>Row Total</th></tr></thead><tbody>"
    
    grand_total = 0
    col_totals = [0] * num_factories

    for p in range(num_products):
        table += f"<tr><td>Product {p+1}</td>"
        row_sum = 0
        for f in range(num_factories):
            value = result['production_plan'][(p, f)]
            table += f"<td>{value}</td>"
            row_sum += value
            col_totals[f] += value
        grand_total += row_sum
        table += f"<td>{row_sum}</td></tr>"

    table += "<tr><td><strong>Column Total</strong></td>"
    for f in range(num_factories):
        table += f"<td>{col_totals[f]}</td>"
    table += f"<td><strong>{grand_total}</strong></td></tr>"
    table += "</tbody></table>"

    return table


def build_transport_plan_table(result, plan_key, num_rows, num_cols, row_label, col_label):
    table = f"<table border='1'><thead><tr><th>{row_label}</th>"
    for col in range(num_cols):
        table += f"<th>{col_label} {col+1}</th>"
    table += "<th>Row Total</th></tr></thead><tbody>"

    grand_total = 0
    col_totals = [0] * num_cols

    for row in range(num_rows):
        table += f"<tr><td>{row_label} {row+1}</td>"
        row_sum = 0
        for col in range(num_cols):
            value = result[plan_key][(row, col)]
            table += f"<td>{value}</td>"
            row_sum += value
            col_totals[col] += value
        grand_total += row_sum
        table += f"<td>{row_sum}</td></tr>"

    table += f"<tr><td><strong>Column Total</strong></td>"
    for col in range(num_cols):
        table += f"<td>{col_totals[col]}</td>"
    table += f"<td><strong>{grand_total}</strong></td></tr></tbody></table>"

    return table


def build_final_inventory_table(num_products, num_factories, num_warehouses, num_customers, production, inventory_pf, inventory_pw, transport_fw, transport_fc, transport_wc):
    """
    Builds the final inventory table that shows the remaining inventory per product at each factory and warehouse.
    """
    table = "<table border='1'><thead><tr><th>Product</th>"
    for f in range(num_factories):
        table += f"<th>Factory {f+1}</th>"
    for w in range(num_warehouses):
        table += f"<th>Warehouse {w+1}</th>"
    table += "</tr></thead><tbody>"

    # For each product, calculate remaining inventory
    for p in range(num_products):
        table += f"<tr><td>Product {p+1}</td>"
        # Remaining inventory at factories
        for f in range(num_factories):
            shipped_from_factory = sum([transport_fw[(f, w)].value() for w in range(num_warehouses)]) + sum([transport_fc[(f, c)].value() for c in range(num_customers)])
            final_factory_inventory = production[(p, f)].value() + inventory_pf[(p, f)] - shipped_from_factory
            table += f"<td>{final_factory_inventory}</td>"
        # Remaining inventory at warehouses
        for w in range(num_warehouses):
            received_at_warehouse = sum([transport_fw[(f, w)].value() for f in range(num_factories)])
            shipped_from_warehouse = sum([transport_wc[(w, c)].value() for c in range(num_customers)])
            final_warehouse_inventory = inventory_pw[(p, w)] + received_at_warehouse - shipped_from_warehouse
            table += f"<td>{final_warehouse_inventory}</td>"
        table += "</tr>"

    table += "</tbody></table>"
    return table
