export const zh: Record<string, string> = {
  // Navigation
  'nav.machines': '机器',
  'nav.defects': '缺陷',
  'nav.downtime': '停机',
  'nav.dashboard': '仪表板',
  'nav.availability': '可用性',
  'nav.serviceOrders': '维修',
  'nav.profile': '个人',
  'nav.settings': '设置',
  'nav.maintenance': '保养',

  // Page titles
  'page.machines': '机器列表',
  'page.machineDetail': '机器详情',
  'page.defects': '缺陷列表',
  'page.defectDetail': '缺陷详情',
  'page.reportDefect': '报告缺陷',
  'page.downtime': '停机记录',
  'page.logDowntime': '登记停机',
  'page.dashboard': '仪表板',
  'page.availability': '可用性看板',
  'page.serviceOrders': '维修工单',
  'page.serviceOrderDetail': '维修工单',
  'page.inspection': '检查',
  'page.profile': '个人资料',
  'page.myActivity': '我的活动',
  'page.settings': '设置',
  'page.login': 'CCT 现场作业',

  // Login
  'login.title': 'CCT 现场作业',
  'login.subtitle': '设备检查系统',
  'login.enterPin': '输入 PIN 码登录',
  'login.signIn': '登录',
  'login.invalidPin': 'PIN 码无效，请重试。',
  'login.pinTooShort': '请输入至少4位数字',
  'login.failed': '登录失败，请重试。',

  // Machine statuses
  'status.available': '可用',
  'status.serviceDue': '待保养',
  'status.down': '停机',
  'status.outForService': '送修中',

  // Defect statuses
  'defect.open': '待处理',
  'defect.acknowledged': '已确认',
  'defect.sentOut': '已送修',
  'defect.resolved': '已解决',
  'defect.deferred': '已延迟',

  // Service order statuses
  'serviceOrder.pending': '待处理',
  'serviceOrder.inService': '维修中',
  'serviceOrder.returned': '已归还',
  'serviceOrder.completed': '已完成',
  'serviceOrder.cancelled': '已取消',

  // Severity
  'severity.low': '低',
  'severity.medium': '中',
  'severity.high': '高',
  'severity.critical': '严重',

  // Downtime codes
  'downtime.mechanical': '机械故障',
  'downtime.hydraulic': '液压故障',
  'downtime.electrical': '电气故障',
  'downtime.tireTrack': '轮胎/履带',
  'downtime.waitingParts': '等待零件',
  'downtime.scheduledService': '定期保养',
  'downtime.weatherAccess': '天气/道路',
  'downtime.other': '其他',

  // Actions
  'action.submit': '提交',
  'action.cancel': '取消',
  'action.save': '保存',
  'action.back': '返回',
  'action.delete': '删除',
  'action.acknowledge': '确认',
  'action.sendForService': '送修',
  'action.markResolved': '标记已解决',
  'action.defer': '延迟处理',
  'action.reopen': '重新打开',
  'action.markInService': '标记维修中',
  'action.markReturned': '标记已归还',
  'action.confirmComplete': '确认完成',
  'action.cancelOrder': '取消工单',
  'action.createOrder': '创建工单',
  'action.startInspection': '开始检查',
  'action.reportDefect': '报告缺陷',
  'action.logDowntime': '登记停机',
  'action.viewOrder': '查看工单',
  'action.viewDetails': '查看详情',
  'action.goBack': '返回',
  'action.signOut': '退出登录',
  'action.viewActivity': '查看我的活动',
  'action.resetData': '重置所有数据',

  // Labels
  'label.machine': '机器',
  'label.severity': '严重程度',
  'label.status': '状态',
  'label.category': '类别',
  'label.description': '描述',
  'label.safeToOperate': '可安全操作',
  'label.safeYes': '是 — 可安全操作',
  'label.safeNo': '否 — 请勿操作',
  'label.reported': '报告信息',
  'label.photos': '照片',
  'label.notes': '备注',
  'label.workshop': '维修厂/供应商',
  'label.dateSent': '送出日期',
  'label.expectedReturn': '预计归还日期',
  'label.dateReturned': '归还日期',
  'label.repairSummary': '维修摘要',
  'label.cost': '费用',
  'label.daysElapsed': '已耗天数',
  'label.meterHours': '仪表工时',
  'label.lastActivity': '最近活动',
  'label.activity': '活动',
  'label.site': '工地',
  'label.reasonCode': '原因代码',
  'label.startTime': '开始时间',
  'label.updateStatus': '更新状态',
  'label.language': 'Language / 语言',
  'label.role': '角色',
  'label.pin': 'PIN 码',
  'label.name': '姓名',
  'label.all': '全部',
  'label.active': '进行中',
  'label.completed': '已完成',
  'label.timeline': '时间线',
  'label.inspection': '检查',
  'label.yourMachine': '您的机器',
  'label.defect': '缺陷报告',
  'label.downtime': '停机事件',
  'label.linkedServiceOrder': '关联维修工单',

  // Filter
  'filter.title': '筛选缺陷',
  'filter.severity': '严重程度',
  'filter.status': '状态',

  // Empty states
  'empty.machines': '暂无机器',
  'empty.machinesDesc': '尚未添加任何机器。',
  'empty.machinesSiteDesc': '该工地暂无分配机器。',
  'empty.defects': '暂无缺陷',
  'empty.defectsDesc': '尚未报告任何缺陷。',
  'empty.defectsFilterDesc': '没有符合筛选条件的缺陷。',
  'empty.inspections': '暂无检查记录',
  'empty.inspectionsDesc': '您完成的检查记录将显示在此处。',
  'empty.myDefects': '暂无缺陷报告',
  'empty.myDefectsDesc': '您报告的缺陷将显示在此处。',
  'empty.serviceOrders': '暂无维修工单',
  'empty.serviceOrdersDesc': '目前没有机器在外维修。',
  'empty.downtime': '暂无停机记录',
  'empty.downtimeDesc': '尚未登记任何停机事件。',
  'empty.timeline': '暂无活动',
  'empty.timelineDesc': '检查、缺陷和停机记录将显示在此处。',
  'empty.notFound': '未找到',
  'empty.machineNotFound': '机器未找到',
  'empty.defectNotFound': '缺陷未找到',
  'empty.orderNotFound': '维修工单未找到',

  // Dashboard
  'dashboard.greeting.morning': '早上好',
  'dashboard.greeting.afternoon': '下午好',
  'dashboard.greeting.evening': '晚上好',
  'dashboard.overview': '以下是您的运营概览',
  'dashboard.criticalDefects': '严重缺陷',
  'dashboard.machinesDown': '停机数量',
  'dashboard.inspectionsToday': '今日检查',
  'dashboard.outForService': '送修中',
  'dashboard.downtimeByCode': '停机原因分布',
  'dashboard.defectsBySeverity': '缺陷严重程度分布',
  'dashboard.inspectionCompliance': '检查合规率',
  'dashboard.hours': '小时',
  'dashboard.requiresAttention': '需要立即处理',

  // Inspection
  'inspection.step': '步骤',
  'inspection.of': '/',
  'inspection.pass': '通过',
  'inspection.fail': '不通过',
  'inspection.na': '不适用',
  'inspection.addNote': '添加备注（可选）',
  'inspection.complete': '检查完成！',
  'inspection.completeDesc': '所有项目已审核完毕。',
  'inspection.redirecting': '正在跳转...',
  'inspection.previous': '上一步',
  'inspection.next': '下一步',
  'inspection.submitInspection': '提交检查',

  // Profile
  'profile.signOutConfirm': '确定要退出登录吗？',
  'profile.version': '版本',

  // Settings
  'settings.dangerZone': '危险操作',
  'settings.resetWarning': '这将永久删除所有数据。',
  'settings.resetConfirm': '输入 RESET 确认',

  // Toast messages
  'toast.defectUpdated': '缺陷状态已更新',
  'toast.defectUpdateFailed': '更新状态失败',
  'toast.serviceOrderCreated': '维修工单已创建',
  'toast.serviceOrderFailed': '创建维修工单失败',
  'toast.downtimeLogged': '停机已登记',
  'toast.downtimeFailed': '登记停机失败',
  'toast.inspectionSubmitted': '检查已提交',

  // Misc
  'misc.machines': '台机器',
  'misc.machine': '台机器',
  'misc.days': '天',
  'misc.optional': '可选',
  'misc.required': '必填',

  // Defect categories
  'category.engine': '发动机',
  'category.hydraulic': '液压',
  'category.electrical': '电气',
  'category.structural': '结构',
  'category.safety': '安全',
  'category.tiresTracks': '轮胎/履带',
  'category.cabControls': '驾驶室/操控',
  'category.lightsSignals': '灯光/信号',
  'category.fluidLeaks': '液体泄漏',
  'category.other': '其他',

  // Role labels
  'role.supervisor': '主管',
  'role.worker': '工人',
  'role.boss': '老板',

  // Form placeholders
  'placeholder.selectMachine': '选择机器…',
  'placeholder.enterWorkshop': '输入维修厂名称',
  'placeholder.additionalDetails': '其他详情…',
  'placeholder.describeIssue': '描述问题（可选）',
  'placeholder.describeRepairs': '描述已完成的维修工作…',

  // Service order & downtime details
  'label.actions': '操作',
  'label.daysElapsedUnit': '天',
  'label.cost.optional': '费用（可选）',
  'label.repairSummaryLabel': '维修摘要',

  // Profile / activity
  'profile.yourActivity': '您的活动',
  'profile.inspectionsCompleted': '完成的检查',
  'profile.defectsReported': '报告的缺陷',
  'profile.appInfo': '应用信息',
  'profile.logOut': '退出登录',
  'profile.logOutConfirmMsg': '确定要退出登录吗？您需要 PIN 码才能重新登录。',

  // Settings section headers
  'settings.dataManagement': '数据管理',
  'settings.inspectionTemplates': '检查模板',
  'settings.downtimeCodes': '停机代码',
  'settings.users': '用户',
  'settings.appInfo': '应用信息',
  'settings.resetDescription': '删除所有本地数据，并在下次加载时重新初始化数据库。此操作无法撤销。',
  'settings.resetModalWarning': '这将永久删除此设备上的所有检查、缺陷、维修及其他记录。下次加载时将重新填入默认数据。',
  'settings.resetModalConfirm': '此操作无法撤销，是否确认？',
  'settings.resetButton': '重置',
  'settings.active': '启用',
  'settings.inactive': '停用',
  'settings.checklistItems': '个检查项',
  'settings.checklistItemsPlural': '个检查项',

  // Downtime history labels
  'downtime.active': '进行中',
  'downtime.history': '历史记录',
  'downtime.allMachines': '所有机器',
  'downtime.noDowntime': '暂无停机记录',
  'downtime.noDowntimeDesc': '当机器停止服务时，登记停机事件。',

  // Service order empty states
  'empty.serviceOrdersActive': '目前没有进行中的维修工单。',
  'empty.serviceOrdersCompleted': '尚无已完成的维修工单。',
  'empty.serviceOrdersAll': '尚未创建任何维修工单。',

  // Defect report
  'defect.reported': '缺陷已报告',
  'defect.reportFailed': '报告缺陷失败',

  // Inspection
  'inspection.itemsFailed': '个项目不通过',
  'inspection.itemsFailedPlural': '个项目不通过',
  'inspection.reportFailedItems': '是否将不通过的项目报告为缺陷？',
  'inspection.skip': '跳过',
  'inspection.reportDefects': '报告缺陷',
  'inspection.backToMachine': '返回机器',
  'inspection.preStart': '启动前检查',
  'inspection.noTemplate': '未找到模板',
  'inspection.itemsOf': '个项目',
  'inspection.currentMeter': '当前仪表读数',

  // Fleet & Team (boss)
  'nav.fleet': '车队',
  'nav.team': '团队',
  'page.fleet': '车队管理',
  'page.team': '团队管理',
  'action.addMachine': '添加机器',
  'action.editMachine': '编辑机器',
  'action.addUser': '添加用户',
  'action.editUser': '编辑用户',
  'action.manageTeam': '管理团队',
  'label.code': '编号',
  'label.machineType': '机器类型',
  'label.siteAssignment': '工地分配',
  'label.userPin': '用户 PIN 码',
  'label.userRole': '用户角色',
  'label.inactive': '停用',
  'empty.fleet': '暂无机器',
  'empty.fleetDesc': '添加您的第一台机器以开始使用。',
  'empty.team': '暂无团队成员',
  'empty.teamDesc': '添加您的第一个团队成员以开始使用。',
  'toast.machineSaved': '机器已保存',
  'toast.machineAdded': '机器已添加',
  'toast.userSaved': '用户已保存',
  'toast.userAdded': '用户已添加',

  // Form field labels
  'field.code': '编号',
  'field.name': '名称',
  'field.type': '类型',
  'field.selectType': '选择类型…',
  'field.site': '工地',
  'field.selectSite': '选择工地…',
  'field.status': '状态',
  'field.pin': 'PIN 码',
  'field.role': '角色',
  'field.location': '位置',
  'field.locationPlaceholder': '例如 沙巴, 马来西亚',

  // Status labels
  'status.active': '启用',
  'status.inactive': '停用',

  // Placeholders
  'placeholder.pinDigits': '4-6 位数字',

  // Sites management
  'label.machines': '机器',
  'label.sites': '工地',
  'action.addSite': '添加工地',
  'action.editSite': '编辑工地',
  'empty.sites': '暂无工地',
  'empty.sitesDesc': '添加您的第一个工地以开始使用。',
  'toast.siteSaved': '工地已保存',
  'toast.siteAdded': '工地已添加',

  // Profile
  'profile.mode': '模式',
  'profile.offlinePwa': '离线优先 PWA',

  // Welcome
  'toast.welcome': '欢迎',

  // Maintenance
  'page.maintenance': '保养',
  'maintenance.overdue': '逾期',
  'maintenance.dueSoon': '即将到期',
  'maintenance.ok': '正常',
  'maintenance.scheduleInfo': '计划信息',
  'maintenance.notFound': '未找到计划',
  'maintenance.notFoundDesc': '此保养计划不存在或已被删除。',
  'maintenance.notes': '备注',
  'placeholder.maintenanceNotes': '描述完成的工作、使用的零件、观察…',
  'toast.maintenanceRecorded': '保养记录已提交',
  'toast.maintenanceFailed': '记录保养失败',

  // Inspection
  'placeholder.describeFault': '描述故障…（可选）',
  'action.reportDefectLink': '报告缺陷 →',

  // Yes/No labels
  'label.yes': '是',
  'label.no': '否',

  // Downtime toasts
  'toast.downtimeStopped': '停机已结束',
  'toast.downtimeStopFailed': '停止停机失败',

  // Inspection toast
  'toast.inspectionFailed': '保存检查失败，请重试。',

  // Machine fallback
  'label.machineHash': '机器',

  // App / system
  'action.stop': '停止',
  'toast.serviceOrderUpdateFailed': '更新维修工单失败',
  'empty.serviceOrderRemoved': '此维修工单可能已被删除。',
  'empty.machineRemoved': '此机器可能已被删除。',
  'machine.outForServiceAt': '送修中 —',
  'inspection.existingInProgress': '今天已有一个进行中的检查。请先完成它。',

  // Settings
  'settings.version': '版本',
  'settings.serviceWorker': 'Service Worker',
  'settings.swRegistered': '已注册',
  'settings.swNotSupported': '不支持',
  'settings.storageUsed': '已用存储',
  'settings.storageQuota': '存储配额',
  'settings.storage': '存储',
  'settings.unavailable': '不可用',
  'settings.noTemplatesFound': '未找到模板。',
  'settings.noUsersFound': '未找到用户。',

  // Error boundary
  'error.title': '出现错误',
  'error.description': '发生意外错误。请尝试重新加载或返回主页。',
  'action.reload': '重新加载',
  'action.home': '主页',

  // Date labels
  'date.today': '今天',
  'date.yesterday': '昨天',

  // Downtime timeline
  'downtime.started': '已开始',
  'downtime.elapsedLabel': '已过',

  // Maintenance detail labels
  'maintenance.interval': '间隔',
  'maintenance.hourInterval': '小时间隔',
  'maintenance.dueDate': '到期日期',
  'maintenance.dueHours': '到期工时',
  'maintenance.currentHours': '当前工时',
  'maintenance.lastCompleted': '上次完成',
  'maintenance.recordCompletion': '记录完成',
  'maintenance.serviceHistory': '维修历史',
  'maintenance.noServiceHistory': '尚无维修历史记录。',
  'maintenance.currentMeterReading': '当前仪表读数',
  'maintenance.everyDays': '每 {n} 天',
  'maintenance.everyHours': '每 {n} 小时',

  // Maintenance getDueInfo
  'maintenance.dueTodayDate': '今天到期',
  'maintenance.dueTomorrow': '明天到期',
  'maintenance.dueInDays': '{n} 天后到期',
  'maintenance.overdueByDays': '逾期 {n} 天',
  'maintenance.overdueByHours': '逾期 {n} 小时',
  'maintenance.dueAtHours': '到期于 {h}（剩余 {n} 小时）',
  'maintenance.dueAtHoursOnly': '到期于 {h}',
  'maintenance.scheduleOk': '计划正常',

  // Defect detail
  'empty.defectRemoved': '此缺陷可能已被删除。',

  // Inspection
  'inspection.noTemplateForType': '此机器类型没有有效的检查模板。',

  // Machine detail banner
  'machine.sentOn': '送出',
};
