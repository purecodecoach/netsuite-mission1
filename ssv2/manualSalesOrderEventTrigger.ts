/**
 * @NScriptName Manual Sales Order Event Trigger
 * @NScriptType ClientScript
 * @NApiVersion 2.0
 * */


import {EntryPoints} from "N/types";
import {runtime, search} from "N";
import * as dialog from "N/ui/dialog"
import {AlertOptions} from "N/ui/dialog";

const pageInit: EntryPoints.Client.pageInit = (context) => {
  /***Todo: Mission 1-2***/
  const locationOptions: any = {fieldId: 'location'}
  locationOptions.value = '1234'
  context.currentRecord.setValue(locationOptions)
}

const validateField: EntryPoints.Client.validateField = (context) => {
  const amountOptions: any = {fieldId: "amount", sublistId: "item", line: context.line - 1}
  const totalOptions: any = {fieldId: 'total'}
  const customerOptions: any = {fieldId: 'entity'}
  const customer = context.currentRecord.getValue(customerOptions)

  /***Todo: Mission 1-3***/
  if (context.fieldId === 'trandate') {
    const pDate = new Date(context
      .currentRecord
      .getValue({
        fieldId: 'trandate'
      })
      .toString()
    ).getDate()

    const tDate = new Date().getDate()

    if (pDate < tDate) {
      const messageOptions: AlertOptions = {
        title: "Date wrong!",
        message: "The date field has to be Today or later."
      }

      dialog
        .alert(messageOptions)
        .then(() => {
          return false
        })
        .catch(() => {
          return false
        })
    }
  }


  /***Todo: Mission 1-4***/
  if (
    context.sublistId === 'item'
    && !!customer
    && (!!context.line && context.line > 0)
    && (context.fieldId === "quantity" || context.fieldId === "rate")
  ) {
    console.log(amountOptions)
    const amount = context.currentRecord.getSublistValue(amountOptions)
    const total = context.currentRecord.getValue(totalOptions)

    const cu = search
      .lookupFields({
        type: search.Type.CUSTOMER,
        id: customer,
        columns: ['balance', 'creditlimit']
      })

    if(!!cu.creditlimit && !!cu.balance) {
      const cl: number = parseFloat(<string>cu.creditlimit);
      const bl: number = parseFloat(<string>cu.balance);
      const am: number = parseFloat(<string>amount);
      const tt: number = parseFloat(<string>total);

      console.log(cl, bl, am, tt)

      if(am + tt + bl > cl) {
        const messageOptions: AlertOptions = {
          title: "Credit Limit Over!",
          message: "You can't add this item because the credit limit is over if you add this."
        }

        dialog
          .alert(messageOptions)
          .then(() => {
            return false
          })
          .catch(() => {
            return false
          })
      }
    }

    console.log(cu)
  }

  return true
}

const fieldChanged: EntryPoints.Client.fieldChanged = (context) => {
  /***Todo: Mission 1-1***/
  if (context.fieldId === 'entity') {
    const salesRepOptions: any = {fieldId: 'salesrep'}
    const entityOptions: any = {fieldId: 'entity'}
    const entity = context.currentRecord.getValue(entityOptions)

    const salesRep = search
      .lookupFields({
        type: search.Type.CUSTOMER,
        id: entity,
        columns: ['salesrep']
      })['salesrep']

    if (!!salesRep[0]) {
      salesRepOptions.value = salesRep[0].value
    } else {
      salesRepOptions.value = runtime.getCurrentUser().id
    }

    context.currentRecord.setValue(salesRepOptions)
  }
}

const saveRecord: EntryPoints.Client.saveRecord = (context) => {
  /***Todo: Mission 1-5***/
  const shippingCountry = context
    .currentRecord
    .getValue({
      fieldId: 'shipcountry'
    })

  if (shippingCountry !== 'US') {
    const messageOptions: AlertOptions = {
      title: "Failed to create!",
      message: "The shipment is available for only United State customer."
    }
    dialog
      .alert(messageOptions)
      .then(() => {
        return false
      })
      .catch(() => {
        return false
      })
  }

  return true
}

export {fieldChanged, pageInit, validateField, saveRecord}