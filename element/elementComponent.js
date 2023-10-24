import Vue from 'vue';

import { Button, Select, Table, Dialog, TableColumn, Form, FormItem, Input, Option, Row, Col, DatePicker,
         Pagination, Loading, Upload, Tooltip, Message, OptionGroup
} from 'element-ui';


 Vue.use(Button)
 Vue.use(Select)
 Vue.use(Table)
 Vue.use(Dialog)
 Vue.use(TableColumn)
 Vue.use(Form)
 Vue.use(FormItem)
 Vue.use(Input)
 Vue.use(Option)
 Vue.use(Row)
 Vue.use(Col)
 Vue.use(DatePicker)
 Vue.use(Pagination)
 Vue.use(Upload)
 Vue.use(Tooltip)
 Vue.use(OptionGroup)
 Vue.use(Loading.directive)

Vue.prototype.$loading = Loading.service;
Vue.prototype.$message = Message;
