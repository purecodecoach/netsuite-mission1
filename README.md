<h1 align="center">Netsuite Mission1</h1>
<h3 align="center">Oracle Netsuite SuiteScript training with example scripts in typescript</h3>

#### Client Script

When the user input sales order manually on UI, we need to do below things

- Sales Rep field = sales rep of the customer, or current login user. (entity field change)
- Location field = predefined default location by you.
- Date field = the user cannot select before date(it should be today or later)
- When the user input item line, if the value of customer's balance + line amount exceeds customer's credit limit, they cannot add item and alert message.
- If shipping address is non-US, then they cannot save sales order.

#### User Event Script

The script for auto assign inventory detail

After submit sales order, we need to assign inventory details of Lot Numbered item lines automatically.

