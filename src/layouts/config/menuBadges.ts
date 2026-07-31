export const MENU_BADGE_PATH_KEY: Record<string, string> = {
  '/apps/kuaizhizao/production-execution/work-orders': 'work_order',
  '/apps/kuaizhizao/production-execution/rework-orders': 'rework_order',
  '/apps/kuaizhizao/production-execution/material-shortage-exceptions': 'exception',
  '/apps/kuaizhizao/production-execution/delivery-delay-exceptions': 'exception',
  '/apps/kuaizhizao/production-execution/quality-exceptions': 'exception',
  '/apps/kuaizhizao/production-execution/outsource-management': 'outsource_work_order',
  '/apps/kuaizhizao/production-execution/packing-binding': 'packing_binding',
  '/apps/kuaizhizao/purchase-management/purchase-orders': 'purchase_order',
  '/apps/kuaizhizao/purchase-management/purchase-requisitions': 'purchase_requisition',
  '/apps/kuaizhizao/purchase-management/receipt-notices': 'receipt_notice',
  '/apps/kuaizhizao/purchase-management/logistics-tracking': 'purchase_logistics',
  '/apps/kuaizhizao/purchase-management/purchase-returns': 'purchase_return',
  '/apps/kuaizhizao/sales-management/sales-orders': 'sales_order',
  '/apps/kuaizhizao/sales-management/sales-forecasts': 'sales_forecast',
  '/apps/kuaizhizao/sales-management/customer-pool': 'customer_pool',
  '/apps/kuaizhizao/sales-management/quotations': 'quotation',
  '/apps/kuaizhizao/sales-management/customer-follow-ups': 'customer_follow_up',
  '/apps/kuaizhizao/sales-management/sample-trials': 'sample_trial',
  '/apps/kuaizhizao/sales-management/shipment-notices': 'shipment_notice',
  '/apps/kuaizhizao/sales-management/sales-returns': 'sales_return',
  '/apps/kuaizhizao/warehouse-management/inbound': 'inbound',
  '/apps/kuaizhizao/warehouse-management/other-inbound': 'other_inbound',
  '/apps/kuaizhizao/warehouse-management/material-returns': 'material_return',
  '/apps/kuaizhizao/warehouse-management/outbound': 'sales_outbound',
  '/apps/kuaizhizao/warehouse-management/other-outbound': 'other_outbound',
  '/apps/kuaizhizao/warehouse-management/material-borrows': 'material_borrow',
  '/apps/kuaizhizao/warehouse-management/delivery-notes': 'delivery_notice',
  '/apps/kuaizhizao/warehouse-management/batching-center': 'batching_order',
  '/apps/kuaizhizao/warehouse-management/material-calls': 'batching_order',
  '/apps/kuaizhizao/warehouse-management/stocktaking': 'stocktaking',
  '/apps/kuaizhizao/warehouse-management/inventory-transfer': 'inventory_transfer',
  '/apps/kuaizhizao/warehouse-management/assembly-orders': 'assembly_order',
  '/apps/kuaizhizao/warehouse-management/disassembly-orders': 'disassembly_order',
  '/apps/kuaizhizao/warehouse-management/customer-material-registration': 'customer_material_registration',
  '/apps/kuaizhizao/quality-management/inspection-center': 'quality_inspection',
  '/apps/kuaizhizao/quality-management/incoming-inspection': 'incoming_inspection',
  '/apps/kuaizhizao/quality-management/process-inspection': 'process_inspection',
  '/apps/kuaizhizao/quality-management/finished-goods-inspection': 'finished_goods_inspection',
  '/apps/kuaizhizao/quality-management/inspection-plans': 'inspection_plan',
  '/apps/kuaizhizao/plan-management/production-plans': 'production_plan',
  '/apps/kuaizhizao/plan-management/demand-computation': 'demand_computation',
  '/apps/kuaizhizao/equipment-management/equipment': 'equipment',
  '/apps/kuaizhizao/equipment-management/molds': 'mold',
  '/apps/kuaizhizao/equipment-management/inspection': 'equipment_inspection',
  '/apps/kuaizhizao/equipment-management/spare-parts': 'spare_part',
  '/apps/kuaizhizao/equipment-management/equipment-faults': 'equipment_fault',
  '/apps/kuaizhizao/equipment-management/maintenance-plans': 'maintenance_plan',
  '/apps/kuaizhizao/equipment-management/maintenance-reminders': 'maintenance_reminder',
  '/apps/kuaicaiwu/finance-management/settlement': 'finance_settlement',
};

// 聚焦“搜索框”未输入时展示的固定常用菜单（制造业日常最常用单据 Top8）
// 说明：使用系统内已存在的 menu `path`，避免依赖“菜单扁平前 N 项”带来的不可控变化
export const TOPBAR_SEARCH_HOT_MENU_PATHS: string[] = [
  '/apps/kuaizhizao/production-execution/work-orders', // 工单
  '/apps/kuaizhizao/purchase-management/purchase-orders', // 采购订单
  '/apps/kuaizhizao/sales-management/sales-forecasts', // 销售预测
  '/apps/kuaizhizao/sales-management/sales-orders', // 销售订单
  '/apps/kuaizhizao/warehouse-management/inbound', // 入库单
  '/apps/kuaizhizao/plan-management/production-plans', // 生产计划
  '/apps/kuaizhizao/quality-management/incoming-inspection', // 来料检验
  '/apps/kuaizhizao/quality-management/process-inspection', // 过程检验
  '/apps/kuaizhizao/quality-management/finished-goods-inspection', // 成品检验
];

/** 根据菜单 path 获取徽章 key（统一去除尾斜杠与查询参数） */
export function getMenuBadgeKey(path: string | undefined): string | undefined {
  if (!path || typeof path !== 'string') return undefined;
  const normalized = path.replace(/\/$/, '').split('?')[0];
  return MENU_BADGE_PATH_KEY[path] ?? MENU_BADGE_PATH_KEY[normalized];
}
