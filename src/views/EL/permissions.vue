<template>
    <div v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0)">
        <div style="margin-top:-20px">
            <p style="font-size:20px;font-weight: bold;">权限管理</p>
        </div>
        <div>
            <el-input
                style="margin-left:15px"
                class="Search"
                size="medium"
                placeholder="请输入英文"
                v-model="input1">
            </el-input>
            <el-input
                style="margin-left:10px"
                class="Search"
                size="medium"
                placeholder="请输入中文名"
                v-model="input2">
            </el-input>
            <el-button  style="margin-left:10px" @click="reset">重置</el-button>
            <el-button type="primary" @click="addRole">添加角色</el-button>
        </div>
        <div class="function">
            <el-collapse v-model="activeColItem" accordion style="width: 500px;" @change="collapseChange">
                <el-collapse-item v-for="(item,index) in roles" :title="item.nameZh" :name="item.id" :key="index">
                    <el-card class="box-card">
                    <div slot="header">
                        <span>可访问的资源</span>
                        <el-button type="text"
                                    style="color: #f6061b;margin: 0px;float: right; padding: 3px 0;width: 15px;height:15px"
                                    icon="el-icon-delete" @click="deleteRole(item.id,item.name,item.nameZh)"></el-button>
                    </div>
                    <div>
                        <el-tree
                                :props="defaultProps"
                                :key="item.id"
                                :data="treeData"
                                :default-checked-keys="checkedKeys"
                                node-key="id"
                                ref="tree"
                                show-checkbox
                                highlight-current
                                >
                        </el-tree>
                    </div>
                    <div style="display: flex;justify-content: flex-end;margin-right: 10px">
                        <el-button size="mini" @click="cancelUpdate">取消修改</el-button>
                        <el-button type="primary" size="mini" @click="updateRoleMenu(item.id,index)">确认修改</el-button>
                    </div>
                    </el-card>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script>

    export default {
        name:'Log',
        inject: ['reload'],
        data() {
            return {
                checkedKeys:[],
                defaultProps:{children: 'children',label: 'name'},
                loading: false,
                activeColItem:-1,
                treeData: [{
                id: 1,
                label: '塔吊管理',
                children: [
                    {
                    id: 3,
                    label: '塔吊管理'
                }, {
                    id: 4,
                    label: '设备管理'
                },{
                    id: 6,
                    label: '用户管理'
                },{
                    id: 7,
                    label: '权限管理'
                },
                //   {
                //     id: 16,
                //     label: '操作日志'
                // }
                ]
                }],
                defaultProps: {
                children: 'children',
                label: 'label'
                },
            roles:[],
            input1: '',
            input2: '',
            }
        },
        methods:{
            load(){
                const _this=this
                this.request.get("/getRole").then(res=>{
                console.log(res)
                 _this.roles=res
            })
            },

            addRole(){
                const _this=this
                let name=this.input1
                let nameZh=this.input2
                let role={name,nameZh}
                this.request.post("/addRole",role).then(res=>{
                    if(res){
                        this.$message.success("添加成功")
                    }else{
                        this.$message.error("填写内容不能为空")
                    }

            })
            clearTimeout(this.timer);  //清除延迟执行

            this.timer = setTimeout(()=>{   //设置延迟执行
                this.load();
            },100);
            },
             reset(){
                this.input1='',
                this.input2='',
                this.load()
            },
            collapseChange(roleId){
                console.log(this.checkedKeys)
                const _this=this
                if(roleId){
                    this.request.get("/getCheckedKey",{
                    params:{
                        roleId:roleId
                    }
                    }).then(res=>{
                        console.log(res)
                       _this.checkedKeys=res
                    })
                }
            },
            updateRoleMenu(roleId,index){
                this.loading=true
                let tree = this.$refs.tree[index];
                let selectedMenuIds = tree.getCheckedKeys(true);
                let treeMenuKeys={
                    roleId,
                    selectedMenuIds,
                }

                this.request.post("/updateRoleMenu",treeMenuKeys).then(res=>{
                        if(res){

                            this.$message.success("修改成功")
                            this.loading=false
                        }
                    })

            },
            deleteRole(id,name,nameZh){
                let role={id,name,nameZh}
                this.request.post("/deleteRole",role).then(res=>{
                        if(res){
                            this.$message.success("删除成功")
                        }
                    })
                this.timer = setTimeout(()=>{   //设置延迟执行
                this.load();
                },100);
            },
            cancelUpdate(){
                this.activeColItem=-1
                this.reload();
            }
        },
         created(){
            this.load()
        }

    }
</script>

<style lang="scss" scoped>
.Search{
    width: 200px;
}
.function{
    margin-top:20px;
    padding: 20px;
    background-color: white;
    border-radius: 7px;

}
</style>
