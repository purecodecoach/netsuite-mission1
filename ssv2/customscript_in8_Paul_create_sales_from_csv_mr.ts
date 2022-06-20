/**
 * @Author Paul Worthy
 * @NScriptName CREATE SALES ORDER FROM CSV FILES
 * @NScriptType MapReduceScript
 * @NApiVersion 2.0
 */

import {EntryPoints} from "N/types";
import {file, record, search} from "N";

const getItem = (id: string | number) =>
{
    const itemSearch  = {
        type: search.Type.ITEM,
        filters: [search.createFilter({ name: 'itemId', operator: search.Operator.IS, values: id })],
        columns: [search.createColumn({name: 'internalid'})]
    }

    const i = search.create(itemSearch).run().getRange({start: 0, end: 1})[0]
    return i.getValue('internalid')
}

const getCustomer = (id: string | number) =>
{
    const customerSearch  = {
        type: search.Type.CUSTOMER,
        filters: [search.createFilter({ name: 'externalid', operator: search.Operator.IS, values: id })],
        columns: [search.createColumn({name: 'internalid'})]
    }

    const i = search.create(customerSearch).run().getRange({start: 0, end: 1})[0]
    return i.getValue('internalid')
}

const getInputData: EntryPoints.MapReduce.getInputData = () =>
{
    const sch = {
        type: search.Type.FOLDER,
        filters: [
            search.createFilter({name: 'internalid', operator: search.Operator.IS, values: 873})
        ],
        columns: [
            search.createColumn({name: 'internalid', join: 'file'})
        ]
    }

    return search.create(sch)
}

const map: EntryPoints.MapReduce.map = (context) =>
{
    const dat = JSON.parse(context.value)
    const fid = dat.values['internalid.file']

    const f = file.load({id: fid.value})

    if (f.fileType === file.Type.CSV) {
        let i = 0;
        let ids = []
        const orders = []
        f.lines.iterator().each((l) =>
        {
            if(i > 0) {
                const row = l.value.split(',')
                orders.push(row)
                ids.push(row[1])
            }
            i++;
            return true
        })

        ids = ids.filter(function (value, index, array) {
            return array.indexOf(value) === index;
        });

        const orderDat = []
        ids.map((i) => {
            const item: any = {}
            const ord = orders.filter((o) => o[1] === i)
            item.customer = getCustomer(ord[0][0])
            item.id = i
            item.items = ord.map((o) => {
                const it = getItem(o[2])
                return {
                    quantity: parseInt(o[3]),
                    price: parseFloat(o[4]),
                    id: it,
                }
            })
            orderDat.push(item)
        })

        orderDat.map((order) => {
            const salesOrder = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true,
            })

            salesOrder.setValue({fieldId: 'entity', value: order.customer});
            salesOrder.setValue({fieldId: 'tranid', value: order.id});
            salesOrder.setValue({fieldId: 'discountrate', value: 0})

            order.items.map((item) => {
                const options = {sublistId: 'item'}
                salesOrder.selectNewLine({...options})
                salesOrder.setCurrentSublistValue({...options, fieldId: 'item', value: item.id})
                salesOrder.setCurrentSublistValue({...options, fieldId: 'rate', value: item.price})
                salesOrder.setCurrentSublistValue({...options, fieldId: 'quantity', value: item.quantity})
                salesOrder.commitLine({...options})
            })

            salesOrder.save({ ignoreMandatoryFields: true });
        })

        f.folder = 874;
        f.save();
    }
}


export {getInputData, map}