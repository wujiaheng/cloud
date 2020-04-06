<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button-group>
        <el-button type="primary" icon="plus" @click="handlerAdd">添加</el-button>
        <el-button type="primary" icon="edit" @click="handlerUpdate">编辑</el-button>
        <el-button type="primary" icon="delete" @click="handlerDelete">删除</el-button>
      </el-button-group>
    </div>

    <el-row>
      <el-col :span="6" style="margin-top:15px;">
        <el-tree
          id="el-cascader"
          class="filter-tree"
          node-key="id"
          highlight-current
          :data="treeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          :default-expand-all="true"
          @node-click="getNodeData"
        />
      </el-col>

      <el-col :span="16" style="margin-top:15px;">
        <el-card class="box-card">
          <el-form ref="form" :rules="rules" :label-position="labelPosition" label-width="100px" :model="form">
            <el-form-item label="父级分类">
              <el-cascader
                v-model="shelectValue"
                :options="options"
                :change-on-select="true"
                placeholder="请选择父级节点"
                :disabled="formRead"
                clearable
                @change="handlItemChange"
                @active-item-change="handlItemChange"
              />
            </el-form-item>
            <el-form-item label="分类名称" prop="name">
              <el-input v-model="form.name" :disabled="formRead" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="分类图片" prop="iconImage">
              <!-- <el-input v-model="form.iconImage" :disabled="formRead" /> -->
              <el-upload
                class="avatar-uploader"
                :disabled="formRead"
                :action="uploadUrl"
                with-credentials
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload">
                <img v-if="form.iconImage" :src="form.iconImage" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>


            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input v-model.number="form.sort" :disabled="formRead" />
            </el-form-item>
            <el-form-item label="分佣比例" prop="scaling">
              <el-input v-model.number="form.scaling" :disabled="formRead" />
            </el-form-item>
            <el-form-item label="启用/禁用" prop="status">
              <el-select v-model="form.status"  class="filter-item" placeholder="请选择字典状态" :disabled="formRead">
                <el-option v-for="(item,index) in enableStatus" :key="index" :label="item.dictLabel" :value="parseInt(item.dictValue)" />
              </el-select>
              <!-- <el-input v-model="form.status" :disabled="formRead" /> -->
            </el-form-item>
            <el-form-item label="关联规格" prop="productNormIds">
              <!-- <el-input v-model="form.productNormIds" :disabled="formRead" /> -->
                <el-select v-model="form.productNormIds" multiple placeholder="请选择" filterable :disabled="formRead">
                  <el-option
                    v-for="(item,index) in normList"
                    :key="index"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="关联品牌" prop="productBrandIds">
              <el-input v-model="form.productBrandIds" :disabled="formRead" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveGroup" :disabled="formRead">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import { fetchGroupByParentId, getPeoductCate, updateGroup, createGroup, getTree, deleteMenu } from '@/api/product/productCate'
import { queryAllNorm } from '@/api/product/productNorm'
import { queryEnableStatus } from '@/api/queryDictAndData'
import { uploadUrl } from '@/api/upload'
export default {
  name: 'MenuManagement',
  filters: {},
  data() {
    return {
      uploadUrl:"",
      total: 0,
      listLoading: true,
      // 当前选中的节点id
      currentId: '',
      formEdit: false,
      formRead: !this.formEdit,
      formStatus: '',
      // 树数据
      treeData: [],
      //状态
      enableStatus:[],
      //规格
      normList:[],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      labelPosition: 'right',
      form: {
        parentId: undefined,
        id: undefined,
        name: '',
        description: '',
        createdTime: '',
        createdBy: '',
        updatedTime: '',
        updatedBy: '',
        productNormIds:[],
        iconImage:""
      },
      // 表单校验规则
      rules: {
        name: [{ required: true, message: '菜单名必填', trigger: 'blur' },
               { min: 2, max: 10, message: '菜单名长度在2到10个字符', trigger: 'blur' }
        ],
        sort: [{ required: true, message: '请填写排序', trigger: 'blur' },
               { type: 'number', message: '请输入数字',trigger: 'blur'},
        ],
        scaling: [{ required: true, message: '请填写分佣比例', trigger: 'blur' },
                  { type: 'number', message: '请输入数字',trigger: 'blur'}
        ],
        status:[{ required: true, message: '请选择状态', trigger: 'blur' }]
      },
      options: [], // 级联选择器数据
      optionsbak: [], // 级联选择器数据备份，用于重置树形结构数据
      shelectValue: [], // 级联选择器当前选中
      cascaderDisabled: true// 级联选择器是否可用
    }
  },
  created() {
    this.getTree()
    this.queryEnableStatus()
    this.uploadUrl = uploadUrl()
  },
  methods: {
    queryEnableStatus() {
      queryEnableStatus().then(response => {
        this.enableStatus=response.data.list
      })
      queryAllNorm().then(response =>{
        this.normList=response.data
      })
    },
    /**
     * 菜单树的级联选择后触发
     */
    handlItemChange(parentList) {
      if (parentList.length <= 0) {
        this.form.pid = ''
        return
      }
      if (parentList.length == 1) {
        this.form.pid = parentList[0]
      } else {
        this.form.pid = parentList[parentList.length - 1]
      }
    },

    /**
       * 查询树形结构
       *
       */
    getTree() {
      getTree().then(response => {
        this.treeData = response.data
        this.options = response.data
        this.optionsbak = response.data
      })
    },
    /**
     * 设置树形结构内当前资源不可用
     * @param {Object} parentId
     */
    setTreeDisable() {
      var that=this
      this.options = this.optionsbak

      function childrenEach(childrenData, id) {
        for (var j = 0; j < childrenData.length; j++) {
          if (childrenData[j].id == id) {
            that.$set(childrenData[j], 'disabled', true,) // 将目前匹配的数组，截断并保存到结果数组，
            break
          } else {
            if (childrenData[j].children) {
              childrenEach(childrenData[j].children, id)
            }
          }
        }
      }
      childrenEach(this.options, this.form.id)
    },


    /**
       * 保存组
       */
    saveGroup() {
      this.$refs['form'].validate((valid) => {
        if(valid){
          var arr = this.form.productNormIds
          var str =""
          if(arr && arr!='null'){
            for(let i=0;i<arr.length;i++){
              if(i==arr.length-1){
                str += arr[i]
              }else{
                str += arr[i]+","
              }
            }
          }
          if(str!=""){
            this.form.productNormIds=str
          }else{
            this.form.productNormIds=null
          }

          if (this.formEdit) {
            // 修改
            updateGroup(this.form).then(response => {
              if (response.code != '000000') {
                this.$notify({
                  title: response.mesg,
                  message: response.data,
                  type: 'error',
                  duration: 3000
                })
              } else {
                this.$notify({
                  title: response.mesg,
                  message: response.data,
                  type: 'success',
                  duration: 3000
                })
                this.form.productNormIds=arr
                this.formRead = true
                this.getTree()
              }
            })
          } else {
            // 添加
            createGroup(this.form).then(response => {
              if (response.code != '000000') {
                this.$notify({
                  title: response.mesg,
                  message: response.data,
                  type: 'error',
                  duration: 3000
                })
              } else {
                this.$notify({
                  title: response.mesg,
                  message: response.data,
                  type: 'success',
                  duration: 3000
                })
                this.form.productNormIds=arr
                this.formRead = true
                this.getTree()
              }
            })
          }
        // this.form.productNormIds=arr
        }
      }
      )
    },
    handlerAdd() {
      this.formEdit = false
      this.formRead = false
      this.cascaderDisabled = false
      this.shelectValue = []
      this.form = {
        productNormIds:[],
        iconImage:"",
        }
    },
    handlerUpdate() {
      this.formEdit = true
      this.formRead = false
      this.cascaderDisabled = false
    },
    handlerDelete() {
      var id = this.form.id
      this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true,
        type: 'warning'
      }).then(() => {
        deleteMenu(id).then(() => {
          this.$notify({
            title: '删除成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getTree()
        })
      })
    },
    onCancel() {

    },

    /**
       * 获取节点数据
       * @param data
       */
    getNodeData(data) {
      this.cascaderDisabled = true
      if (!this.formEdit) {
        this.formStatus = 'update'
      }
      getPeoductCate(data.id).then(response => {
        this.form = response.data
        var normIds = this.form.productNormIds
        if(normIds){
          var arr = normIds.split(",")
          this.form.productNormIds=arr
        }else{
          this.form.productNormIds=[]
        }
        this.shelectValue = this.changeParentSelect(response.data.pid, this.options)
        // this.setTreeDisable()
      })
      this.currentId = data.id
      this.formRead = true
    },
    /**
     * 级联选择器回显
     * @param {Object} key  父ID
     * @param {Object} treeData
     */
    changeParentSelect(key, treeData) {
      const arr = [] // 在递归时操作的数组
      let returnArr = [] // 存放结果的数组
      let depth = 0 // 定义全局层级
      // 定义递归函数
      function childrenEach(childrenData, depthN) {
        for (var j = 0; j < childrenData.length; j++) {
          depth = depthN // 将执行的层级赋值 到 全局层级
          arr[depthN] = (childrenData[j].id)
          if (childrenData[j].id == key) {
            returnArr = arr.slice(0, depthN + 1) // 将目前匹配的数组，截断并保存到结果数组，
            break
          } else {
            if (childrenData[j].children) {
              depth++
              childrenEach(childrenData[j].children, depth)
            }
          }
        }
        return returnArr
      }
      return childrenEach(treeData, depth)
    },
    handleAvatarSuccess(res, file) {
        console.log(res)
         console.log(file)
        this.form.iconImage = res.data;
    },
    beforeAvatarUpload(file) {
      const isIMG = new RegExp('image/*').test(file.type);
      const isLt2M = file.size / 1024 / 1024 < 20;

      // if (!isIMG) {
      //     this.$message.error('只能上传图片文件!');
      // }
      // if (!isLt2M) {
      //     this.$message.error('上传图片大小不能超过 20MB!');
      // }
      // return isIMG && isLt2M;
      return true
    },
    /**
       * 搜索node节点
       */
    filterNode() {
    }

  }
}
</script>
<style>
 .avatar-uploader .el-upload {
   border: 1px dashed #d9d9d9;
   border-radius: 6px;
   cursor: pointer;
   position: relative;
   overflow: hidden;
 }
 .avatar-uploader .el-upload:hover {
   border-color: #409EFF;
 }
 .avatar-uploader-icon {
   font-size: 28px;
   color: #8c939d;
   width: 178px;
   height: 178px;
   line-height: 178px;
   text-align: center;
 }
 .avatar {
   width: 178px;
   height: 178px;
   display: block;
 }
 </style>
