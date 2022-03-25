/**
 * @NScriptName Auto Assign Inventory Detail
 * @NScriptType UserEventScript
 * @NApiVersion 2.0
 * */


import {EntryPoints} from "N/types";
import {record, search} from "N";

//find details
const searchInventoryDetails = (item) => {
  search.load({
    type: search.Type.INVENTORY_DETAIL,
    id: item
  })
  return ""
}

//generateDetails
const generateInventoryDetails = () => {
  return ""
}

//assign details
const assignInventoryDetail = (context: EntryPoints.UserEvent.afterSubmitContext, details, line: number) => {
  context.newRecord.setSublistValue({
    sublistId: 'item',
    line: line,
    fieldId: 'inventorydetail',
    value: details
  })
}

//main
const afterSubmit: EntryPoints.UserEvent.afterSubmit = (context: EntryPoints.UserEvent.afterSubmitContext) => {
  if (context.type !== context.UserEventType.CREATE) return

  Array.from(Array(context.newRecord.getLineCount({sublistId: 'item'})).keys()).map((line) => {
    const fso = {sublistId: 'item', line: line}
    const item = context.newRecord.getSublistValue({...fso, fieldId: 'item'})
    const qty = context.newRecord.getSublistValue({...fso, fieldId: 'quantity'})
    const inventories = searchInventoryDetails(item)
    const inventoryDetail = generateInventoryDetails();
    assignInventoryDetail(context, inventoryDetail, line)
  })
}

export {afterSubmit}