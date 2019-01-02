CheckLogin();

function CheckLogin() {
	if (sessionStorage.Name == undefined || sessionStorage.Password == undefined) {
		alert('您还没有登录，请登录账号！')
		window.location.href = "login.html?goAddress='autoControl.html'";
	}
}

//全局变量
var BaseUrl = "http://211.149.245.105:8866/MonitorService.svc/webHttp/";
var data = {
	Name: sessionStorage.Name,
	Password: sessionStorage.Password
};
var msg = JSON.stringify(data);
// 全局变量存储权限大棚的名字和id
var ownRights_G=getOwnRights();

window.onload=function(){
	
	// 参数范围输入框值发生变化时
	$(".inputRange").change(function(){
		// 按钮背景色发生变化
		$(this).parent().parent().find(".btnChange").css("background","#0099FF");
		//解除按钮禁用
		$(this).parent().parent().find(".btnChange").removeAttr("disabled");
		//设置按钮文本
        $(this).parent().parent().find(".btnChange").text("更改");
	})
	/*-------------------------获取参数正常范围-----------------------*/

	/*数据接口调用*/
	
	//获取登录用户的权限
	$.ajax({
		url: BaseUrl + "GetOwnRights", //相对应的esb接口地址
		type: 'post',
		data: msg, //向服务器（接口）传递的参数
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success:function(data){
			var otg=data.GetOwnRightsResult;
			var houseId=[];
			var houseName=[];
			// 大棚标签多于4个时,显示左右箭头，且多出部分隐藏
			if(otg.length>4)
			{
				// 显示箭头
				$("#autoControl-list #left,#autoControl-list #right").show();
			}
			else
			{
				// 隐藏箭头
				$("#autoControl-list #left,#autoControl-list #right").hide();
			}
			// 动态生成大棚标签列表
			for(var m=0;m<otg.length;m++)
			{
				// 获取大棚id和大棚名字
				houseId.push(otg[m].GreenHouseID);
				houseName.push(otg[m].HouseName);
				// 大棚标签列表
				var newDiv=$("<div class='farm-nav'></div>");
				var newSpan=$("<span></span>");
				// 添加大棚名
				$(newSpan).text(otg[m].HouseName);
				// 附加子元素
				$(newDiv).append(newSpan);
				$("#autoControl-list #farmList").append(newDiv)
			}
			// 为第一个大棚名字标签设置id
			$(".farm-nav:eq(0)").attr("id","active");
			
			var farmNav=document.getElementsByClassName('farm-nav');
			//根据权限显示大棚
			for(var i=0;i<farmNav.length;i++)
			{
				if($(farmNav[i]).find("span").text()!=houseName[i])
				{
					farmNav[i].style.display="none";
				}
			}

			//获取登陆用户的个人信息
			$.ajax({
				url: BaseUrl + "GetOwnInfo", //相对应的esb接口地址
				type: 'post',
				data: msg, //向服务器（接口）传递的参数
				dataType: "json",
				contentType: "application/json;charset=utf-8",
				success:function(data){
					var otg=data.GetOwnInfoResult;
					var userType=otg[0].UserType;
					userId_G=otg[0].UserID;
					var data1={GreenHouseID:houseId[0]};
					var msg1=JSON.stringify(data1);

					getNormalRange(msg1);
					

					//定义当前导航栏触发的大棚id
					//默认为House1
					var activeHouseId=houseId[0];

					//导航栏切换
					var contentList=document.getElementById('autoControl-list');
					var aNavDiv=contentList.getElementsByClassName('farm-nav');
					var aDiv=document.getElementsByClassName('autoControl-show');

					for (var i = 0; i < aNavDiv.length; i++) {
						//切换到某个大棚时
						aNavDiv[i].onclick=function(){
							for (var j = 0; j < aNavDiv.length; j++) {
								aNavDiv[j].setAttribute("id","");
							}
							this.setAttribute("id","active");
							activeHouseId=getHouseId($("#active span").text());
							// 获取参数范围
							var data={
								GreenHouseID:activeHouseId
							};
							var msg=JSON.stringify(data);
							getNormalRange(msg);
							//调用函数获取开关状态
							switchConfig(activeHouseId,userId_G);
						}
					}
					//页面新打开时调用函数获取开关状态
					switchConfig(activeHouseId,userId_G);
					
				}
			});
		}
	});
	
	//轮播图控制左右移动
	//左箭头点击事件
	$("#autoControl-list #left").click(function () {
		// 得到总的大棚标签数
		var circleNum=$("#farmList .farm-nav").length;
		// 获取可见的左数第一个标签在父元素中的索引值
		var index=$("#farmList .farm-nav:visible:eq(0)").index()+1;
		// 得到移动到的位置索引值
		var moveToIndex=circleNum-index;
		// 把第一个元素移动到倒数第一个位置，依次类推
		$("#farmList .farm-nav:visible:eq(0)").insertAfter($("#farmList .farm-nav:last-child"));
	});
	//右箭头点击事件
	$("#autoControl-list #right").click(function () {
		
		// 获取可见的左数第一个大棚标签在父元素中的索引值
		var index=$("#farmList .farm-nav:visible:eq(0)").index();
		// 得到移动到的位置索引值
		var moveToIndex=index;
		// 把最后一个元素移动到第一个位置，依次类推
		$("#farmList .farm-nav:last-child").insertBefore($("#farmList .farm-nav:eq("+moveToIndex+")"));
	});

}

// 开关控制部分的定时刷新
setInterval("timedRefresh()",10000); 

// 参数范围部分的定时刷新
setInterval("rangeTimedRefresh()",10000);


/*-------------------------创建的函数---------------------------*/
// 获取自己的权限，返回权限信息对象
function getOwnRights()
{
	var obj=null;
	$.ajax({
		url: BaseUrl + "GetOwnRights", //相对应的esb接口地址
		type: 'post',
		data:msg, //向服务器（接口）传递的参数
		dataType: "json",
		// 同步方式
		async:false,
		contentType: "application/json;charset=utf-8",
		success:function(data){
			obj=data.GetOwnRightsResult;
		}
	})
	return obj;
}		
//获得大棚id函数
// 传入参数为大棚名字
function getHouseId(houseName)
{	
	// 创建数组变量存储权限内的大棚id
	var houseId=null;
	var obj=ownRights_G;
	for(var i=0;i<obj.length;i++)
	{
		if(obj[i].HouseName==houseName)
		{
			houseId=obj[i].GreenHouseID;
		}
	}
	return houseId;
	
}
//单个开关转换函数
function Switch(obj)
{
	if(obj.className=="switch-open")
	{
		obj.className="switch-close";
		obj.innerHTML="<span class='close-bold-gray'>关</span>"+
					"<span class='close-gray'></span>";
	}
	else {
		obj.className="switch-open";
		obj.innerHTML="<span class='open-green'>开</span>"+
					"<span class='open-gray'></span>";
	}
}
//获取参数正常范围函数
function getNormalRange(param)
{	
	// 清空之前的参数范围值
	$(".inputRange").val("");

	$.ajax({
		url:  "http://211.149.245.105:8866/MonitorService.svc/webHttp/GetNormalRangeConfig", //相对应的esb接口地址
		type: 'post',
		data:param, //向服务器（接口）传递的参数
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success:function(data){
			var otg=data.GetNormalRangeConfigResult;
			var aSetRange=$(".setRange");
			//得到适宜参数值的最小和最大值
			for(var i=0;i<otg.length;i++)
			{	
				$(aSetRange[i]).find("#inputMin").val(otg[i].MinValue);
				$(aSetRange[i]).find("#inputMax").val(otg[i].MaxValue);	
			}
		}
	});
}

//更改图片路径函数
function changeImagePath(index,type,imgVar)
{
	//根据按钮索引值以及设备类型确定设备图片的路径
	switch(type)
	{
		
		case '顶窗':switch(index)
		{
			case 0:$(imgVar).attr("src","imges/dingchuang-close.png");break;
			case 1:$(imgVar).attr("src","imges/dingchuang-close.png");break;
			case 2:$(imgVar).attr("src","imges/dingchuang-open.png");break;
		}
		break;
		case '侧窗':switch(index)
		{
			case 0:$(imgVar).attr("src","imges/cechuang-close.png");break;
			case 1:$(imgVar).attr("src","imges/cechuang-close.png");break;
			case 2:$(imgVar).attr("src","imges/cechuang-open.png");break;
		}
		break;
		case '内遮阳':switch(index)
		{
			case 0:$(imgVar).attr("src","imges/neizheyang-close.png");break;
			case 1:$(imgVar).attr("src","imges/neizheyang-close.png");break;
			case 2:$(imgVar).attr("src","imges/neizheyang-open.png");break;
		}
		break;
		case '内保温':switch(index)
		{
			case 0:$(imgVar).attr("src","imges/neibaowen-close.png");break;
			case 1:$(imgVar).attr("src","imges/neibaowen-close.png");break;
			case 2:$(imgVar).attr("src","imges/neibaowen-open.png");break;
		}
		break;
		case '循环风机':switch(index)
		{
			case "0":$(imgVar).attr("src","imges/xunhuanfengji-close.png");break;
			case "1":$(imgVar).attr("src","imges/xunhuanfengji-open.png");break;
			
		}
		break;
		case '暖风机':switch(index)
		{
			case "0":$(imgVar).attr("src","imges/nuanfengji-close.png");break;
			case "1":$(imgVar).attr("src","imges/nuanfengji-open.png");break;
			
		}
		break;
		case '风机降温':switch(index)
		{
			case "0":$(imgVar).attr("src","imges/jiangwen-close.png");break;
			case "1":$(imgVar).attr("src","imges/jiangwen-open.png");break;
			
		}
		break;
		case '补光灯':switch(index)
		{
			case "0":$(imgVar).attr("src","imges/buguang-close.png");break;
			case "1":$(imgVar).attr("src","imges/buguang-open.png");break;
			
		}
		break;
		case '滴灌水泵':switch(index)
		{
			case "0":$(imgVar).attr("src","imges/shuibeng-close.png");break;
			case "1":$(imgVar).attr("src","imges/shuibeng-open.png");break;
			
		}
		break;
	}
}
//改变参数范围函数
function changeRange(obj)
{	
	// 按钮变化
	//改变按钮文本
	$(obj).text("已更改");
	$(obj).css("background","#999999");
	//禁用按钮
	$(obj).attr("disabled","disabled");

	//获得输入框的值
	var minValue=$(obj).parent().parent().find("#inputMin").val();
	var maxValue=$(obj).parent().parent().find("#inputMax").val();
	//当前所在大棚id
	var activeHouseId=getHouseId($("#active span").text());
	//要改变的环境参数名字
	var paramName=$(obj).parent().parent().find(".param").text();

		//调用接口获取编号与用户id
		var data1={
			GreenHouseID:activeHouseId
		};
		var msg1=JSON.stringify(data1); 
		$.ajax({
			url: BaseUrl + "GetNormalRangeConfig", //相对应的esb接口地址
			type: 'post',
			data: msg1, //向服务器（接口）传递的参数
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success:function(result){
				var obj=result.GetNormalRangeConfigResult;

				//用户id
				var userId="";
				//名字id
				var nameId="";
				
				for(var i=0;i<obj.length;i++)
				{	//找到与环境参数名字对应的那一项，获取数据
					if(obj[i].Name=="适宜"+paramName+"范围")
					{
						userId=obj[i].UserID;
						nameId=obj[i].NameID;
					}
				}
				//传递给更新范围接口
				var data2={
					GreenHouseID:activeHouseId,
					MinValue:minValue,
					MaxValue:maxValue,
					NameID:nameId,
					UserID:userId
				};
				var msg2=JSON.stringify(data2);
				$.ajax({
					url: BaseUrl + "UpdateNormalRangeConfig", //相对应的esb接口地址
					type: 'post',
					data: msg2, //向服务器（接口）传递的参数
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					success:function(result){
						var obj=result.UpdateNormalRangeConfigResult;
						// 成功
						if(obj)
						{
							confirm("更改成功！");
						}
						// 失败
						else
						{
							confirm("更改失败！");
						}
					}
				})
			}
		})
	
	
}
//自动开启开关函数
function updateSwitchAutoConfig(houseId,remark,autoConfig,userId,checkbox)
{
	var data1={
		GreenHouseID:houseId,
		Remark:remark,
		AutoConfig:autoConfig,
		UserID:userId
	};
	console.table(data1);
	var msg1=JSON.stringify(data1);
	$.ajax({
		url: BaseUrl + "UpdateSwitchAutoConfig", //相对应的esb接口地址
		type: 'post',
		data: msg1, //向服务器（接口）传递的参数
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success:function(result)
		{
			var obj=result.UpdateSwitchAutoConfigResult;
			var checkBoxVal=autoConfig.slice(0,1);
		}
	})
}
//获取开关状态函数
function switchConfig(houseId,userId)
{
	var activeHouseData={
		GreenHouseID:houseId
	};
	var activeHouseMsg=JSON.stringify(activeHouseData);
	//获得所负责大棚设备的开关状态，将数据传到页面
	$.ajax({
			url: BaseUrl + "GetSwitchStateNow", //相对应的esb接口地址
			type: 'post',
			data:activeHouseMsg, //向服务器（接口）传递的参数
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success:function(data){
				//获得返回数据
				var target=data.GetSwitchStateNowResult;
				//判断返回结果是否为空
				if(target.length==0)
				{						
					//清楚之前页面的内容
					$("#right-switch").html("");
					//创建ul元素
					var ulEle=$("<ul class='rightUl'></ul>");
					//附加到div
					$("#right-switch").append(ulEle);
				}
				else
				{
					// 左边参数范围面板显示
					$("#left-range").show();					
				}
				
				// 循环得到每种设备，调用添加设备函数添加设备到页面
				for(var i=0;i<target.length;i++)
				{
					addDevice(i);
				}
				function addDevice(index){
					 //获得设备类型
					var deviceType=target[index].DeviceType;
					//用变量表示不同的图像
					var path="";					
					//创建一个li
					var oli=$("<li class='btnSingleLi'></li>");
					$(".rightUl").append($(oli));
					//为li添加子元素
					var divChild=$("<div class='device'></div>")
					$(oli).append($(divChild));
					//创建图像节点作为divChild的子节点
					var image=$("<img class='images' />");				 
					$(divChild).append($(image));
					//创建p元素作为divChild的子节点
					var pEle=$("<p class='deviceText'></p>");
					$(divChild).append($(pEle));
					//自动开启功能元素
					if(deviceType!="补光灯")
					{
						var autoConfigDiv=$("<div class='autoConfig'></div>");
						var checkBox=$("<input type='checkbox' class='checkbox'>");
						var autoOpenText=$("<span class='autoConfigText'>当空气温度低于适宜温度时自动开启</span>");
						$(autoConfigDiv).append(checkBox);
						$(autoConfigDiv).append(autoOpenText);
						$(oli).append($(autoConfigDiv));
					}
					else
					{
						var autoConfigDiv=$("<div class='autoConfigForBGD'></div>");
						var checkBox=$("<input type='checkbox' class='checkbox'>");
						var span1=$("<span>每日</span>");
						var span2=$("<span>至次日</span>");
						var span3=$("<span>开启</span>");
						var input1=$("<input type='text'>");
						var input2=$("<input type='text'>");
						var img1=$("<img src='imges/clock.png'>");
						var img2=$("<img src='imges/clock.png'>");
						$(autoConfigDiv).append(checkBox);
						$(autoConfigDiv).append(span1);
						$(autoConfigDiv).append(input1);
						$(autoConfigDiv).append(img1);
						$(autoConfigDiv).append(span2);
						$(autoConfigDiv).append(input2);
						$(autoConfigDiv).append(img2);
						$(autoConfigDiv).append(span3)
						$(oli).append($(autoConfigDiv));
					}
					//当设备需要一组按钮时
					if(deviceType=="内遮阳"||deviceType=="内保温"||deviceType=="顶窗"||deviceType=="侧窗")
					{
						//创建select节点作为oli的子节点
						var selectEle=$("<select class='deviceSelectSpecial'></select>");
						$(oli).append($(selectEle));
						//创建按钮组
						var btnGroup=$("<div class='btnGroup'></div>");
						var buttonChilds=$("<button>拉上</button><button>暂停</button><button >拉开</button>");
						//将创建的元素附加到父节点
						$(btnGroup).append($(buttonChilds));
						$(oli).append($(btnGroup));
						//表示当前选中项的按钮索引值
						var switchStatusIndex1=null;
						//获取选中项在后台数组中的起始位置
						var initIndex=0;//target[index].RemarkList.length-2						
						// 获取第一个设备的自动开启状态
						var autoConfigValue=target[index].RemarkList[0].AutoConfig;
						// 为"0"开启自动控制，复选框未选中
						if(autoConfigValue=="0")
						{
							$(checkBox).attr("checked",false);
						}
						// 为"1"开启自动控制，复选框选中
						else
						{
							$(checkBox).attr("checked",true);
						}					
						//获取开关的状态显示到页面
						if((target[index].RemarkList[initIndex].Value=="1")&&(target[index].RemarkList[initIndex+1].Value=="0"))
						   {
							   // 判断设备id的大小，设置按钮索引
							   if(target[index].RemarkList[initIndex].DeviceID<target[index].RemarkList[initIndex+1].DeviceID)
							   {
								   //拉上
								   switchStatusIndex1=0;
							   }
							   else
							   {
								   //拉开
								   switchStatusIndex1=2;
							   }							   
						   }
						   else if((target[index].RemarkList[initIndex].Value=="0")&&(target[index].RemarkList[initIndex+1].Value=="0"))
						   {
							   //暂停
							   switchStatusIndex1=1;
						   }
						   else if((target[index].RemarkList[initIndex].Value=="0")&&(target[index].RemarkList[initIndex+1].Value=="1"))
						   {
							   // 判断设备id的大小，设置按钮索引
							   if(target[index].RemarkList[initIndex].DeviceID<target[index].RemarkList[initIndex+1].DeviceID)
							   {
								   //拉开
								   switchStatusIndex1=2;
							   }
							   else
							   {	
								   //拉上
								   switchStatusIndex1=0;
							   }
						   }
						//根据按钮索引值以及设备类型确定设备图片的路径
						changeImagePath(switchStatusIndex1,deviceType,image);
						//为状态按钮设置id，更改背景色
						$(btnGroup).children("button").eq(switchStatusIndex1).attr("id",'currentStatus');
						//为每一个按钮组的button添加点击事件
						$(buttonChilds).click(function(){							
							//获取所点击的button的索引
							var btnIndex=$(this).index();
							var clickObj=this;
							//获得选中项的设备备注
							var remark=$(selectEle).children("option:selected").text();							
							//定义变量存放开关值
							var value1="";
							var value2="";							
							//根据按钮索引值确定开关状态值,更改设备的图片
							switch(btnIndex)
							{
								case 0:value1="1";value2="0";break;
								case 1:value1="0";value2="0";break;
								case 2:value1="0";value2="1";break;
							}
							//根据按钮索引值以及设备类型确定设备图片的路径
							changeImagePath(btnIndex,deviceType,image);						
							//传递给接口的数据
							var dataForSwitchStatus={
								GreenHouseID:houseId,
								Remark:remark,
								Value1:value1,
								Value2:value2,
								UserID:userId
							};
							var msgForSwitchStatus=JSON.stringify(dataForSwitchStatus);
							//调用数据接口，获得设备的开关状态
							$.ajax({
								url: BaseUrl + "UpdateDeviceStatus", //相对应的esb接口地址
								type: 'post',
								data:msgForSwitchStatus, //向服务器（接口）传递的参数
								dataType: "json",
								contentType: "application/json;charset=utf-8",
								success:function(result)
								{				
									if(result.UpdateDeviceStatusResult)
									{	
										var dataForHouseId={
											GreenHouseID:houseId
										};
										var msgForHouseId=JSON.stringify(dataForHouseId);
										var updateResult=getUpdatedDeviceSwitchValue(deviceType,remark,msgForHouseId);
										//获取开关的状态显示到页面
										// 定义变量存储按钮组索引
										var switchStatusIndex=null;
										if(updateResult[0]=="0"&&updateResult[1]=="1")
										{											
											// 拉上
											switchStatusIndex=2;
										}
										else if(updateResult[0]=="0"&&updateResult[1]=="0")
										{
											//暂停
											switchStatusIndex=1;
										}
										else if(updateResult[0]=="1"&&updateResult[1]=="0")
										{											
											//拉开
											switchStatusIndex=0;
										}
										//清除针对之前开关状态设置的id
										for(var i=0;i<$(btnGroup).children("button").length;i++)
										{
											$(btnGroup).children("button").eq(i).attr("id",'');
										}
										//为状态按钮设置id，更改背景色
										$(btnGroup).children("button").eq(switchStatusIndex).attr("id",'currentStatus');
									}	
									else
									{
										alert("更新开关状态失败，请稍候再试！");
									}			
								}
							});
						});
					}
					//当设备需要一个开关按钮时
					else{
						//自动开关配置
						var deviceRemark=target[index].RemarkList[0].Remark;
						//创建select节点作为oli的子节点
						var selectEle=$("<select class='deviceSelectNormal'></select>");
						$(oli).append($(selectEle));
						 //创建开按钮
						var pSwitch=$("<img alt='开关'  class='btnImg'/>");
						$(pSwitch).css({"width":"46px","height":"20px"});
						//添加开关元素节点
						$(oli).append($(pSwitch));
						//存放设备的开关值
						var value=[];
						// 获取第一个设备的自动开启状态
						if(target[index].DeviceType!="补光灯")
						{
							var autoConfigValue=target[index].RemarkList[0].AutoConfig;
							// 为"0"开启自动控制，复选框未选中
							if(autoConfigValue=="0")
							{
								$(checkBox).attr("checked",false);
							}
							// 为"1"开启自动控制，复选框选中
							else
							{
								$(checkBox).attr("checked",true);
							}
						}
						else
						{
							var autoConfigValue=target[index].RemarkList[0].AutoConfig;
							if(autoConfigValue.split(".")[0]=="0")
							{
								$(checkBox).attr("checked",false);
							}
							else
							if(autoConfigValue.split(".")[0]=="1")
							{
								$(checkBox).attr("checked",true);
								$(input1).val(autoConfigValue.split(".")[1]);
								$(input2).val(autoConfigValue.split(".")[2]);
							}
						}
						//获得设备的开关值，将它保存到数组中
						for(var i=0;i<target[index].RemarkList.length;i++)
						{
							//获得此种设备的每个开关值
							value[i]=target[index].RemarkList[i].Value;
						}
						//值为1时
						if(value[0]=="1")
						{
							//设置按钮属性，显示“开”状态
							$(pSwitch).attr("src","imges/switchOn.png");
							$(pSwitch).attr("id","on");
							
						}
						//值为0时
						else
						if(value[0]=="0")
						{ 
							//设置按钮属性，显示“关”状态
							$(pSwitch).attr("src","imges/switchOff.png");
							$(pSwitch).attr("id","off");							
						}
						//根据按钮开关值以及设备类型确定设备图片的路径
						changeImagePath(value[0],deviceType,image);
						//按钮点击事件
						$(pSwitch).click(function(){
							//获取被点击对象
							var clickObj=this;
							//获取被选中的设备项
							var selectedDevice=$(this).parent().children("select").children("option:selected").text();
							//用来获取对应的设备id
							var deviceID="";
							//遍历得到设备id
							for(var i=0;i<target[index].RemarkList.length;i++)
							{
								//若备注名与选中值相同，则获取其设备id
								if(target[index].RemarkList[i].Remark==selectedDevice)
								{
									deviceID=target[index].RemarkList[i].DeviceID;
								}
							}

							//定义变量用来获得开关值
							var value="";
							//在开状态点击按钮时
							if(this.id=="on")
							{
								//开关值设为0
								value="0";								
							}
							//在关状态点击按钮时
							else
							{
								//开关值设为1
								value="1";
							}
							//根据按钮开关值以及设备类型确定设备图片的路径
							changeImagePath(value,deviceType,image);
							//要传递的数据
							var data={
								GreenHouseID:houseId,
								DeviceID:deviceID,
								Value:value,
								UserID:userId
							};
							var msg=JSON.stringify(data);
							//更新开关状态
							$.ajax({
								url: BaseUrl + "UpdateSwitchStateNow", //相对应的esb接口地址
								type: 'post',
								data:msg, //向服务器（接口）传递的参数
								dataType: "json",
								contentType: "application/json;charset=utf-8",
								success:function(result)
								{									
									// 更新成功
									if(result.UpdateSwitchStateNowResult)
									{
										//传入参数为：（1）设备类型 （2）设备的备注名（3）被点击的开关对象(4)所在大棚id字符串对象
										var activeData={
											GreenHouseID:data.GreenHouseID
										};
										var activeMsg=JSON.stringify(activeData);
										
										var result=getUpdatedDeviceSwitchValue(deviceType,selectedDevice,activeMsg);
					
										if(result[0]=="1")
										{
											$(clickObj).attr("src","imges/switchOn.png");
										    $(clickObj).attr("id","on");
										}
										else
										{
											$(clickObj).attr("src","imges/switchOff.png");
										    $(clickObj).attr("id","off");	
										}
									}
									// 更新失败
									else
									{
										alert("更新开关状态失败，请稍候再试！");
									}	
								}
							});
						})
					}	
					//将设备类型名放到p元素里
					$(pEle).text(target[index].DeviceType);
					//获取某种设备类型的列表，将每个设备的备注名放到数组arr里
					var arr=[];
					for(var i=0;i<target[index].RemarkList.length;i++)
					{
						arr.push(target[index].RemarkList[i].Remark);
					}					
					//一个新的临时数组,用来存放去重后的备注名
					var newArr=[];
					//对数组进行去重操作
					uniq(arr);
					//去重函数
					function uniq(array){					   
						//遍历当前数组 
						for(var i = 0; i < array.length; i++)
						{ 
							// 如果当前数组的第i已经保存进了临时数组，那么跳过否则把当前项push到临时数组里面 						
							if (newArr.indexOf(array[i])== -1)
							{
								newArr.push(array[i]); 
							}
							else continue;
						} 
						return newArr; 
					} 
					//排序
					// newArr.sort();
					//把经过去重操作的备注名放到选择框里
					for(var i=0;i<newArr.length;i++)
					{
						var newOption=$("<option value="+i+"></option>");
						$(newOption).text(newArr[i]);
						$(selectEle).append(newOption);
					}
					//当设备选择框的值发生变化时
					$(selectEle).change(function(){
						//如果是特殊的开关组
						if(deviceType=="内遮阳"||deviceType=="内保温"||deviceType=="顶窗"||deviceType=="侧窗")
						{
							//创建数组用于存放属于同一备注的元素
							var btnGroupArr=[];
							//用来表示按钮索引值
							var switchStatusIndex2=null;
							//获取到被选项的文本值
							var selectedText=this.options[this.options.selectedIndex].innerHTML;
							//获取到被选项的value值
							var selectedValue1=this.options[this.options.selectedIndex].value;
							var selectedIndex=Math.pow(2,selectedValue1);
							// 获取所选设备的自动开启状态
							var autoConfigValue=target[index].RemarkList[selectedIndex].AutoConfig;
							// 为"0"开启自动控制，复选框未选中
							if(autoConfigValue=="0")
							{
								$(checkBox).attr("checked",false);
							}
							// 为"1"开启自动控制，复选框选中
							else
							{
								$(checkBox).attr("checked",true);
							}
							// 按钮索引值
							var switchStatusIndex2=null;

							var dataForHouseId={
								GreenHouseID:houseId
							};
							var msgForHouseId=JSON.stringify(dataForHouseId);
							var resultForSwitchStatus=getUpdatedDeviceSwitchValue(deviceType,selectedText,msgForHouseId);
							if(resultForSwitchStatus[0]=="0"&&resultForSwitchStatus[1]=="1")
							{
								//拉上
								switchStatusIndex2=2;
							}
							else
							if(resultForSwitchStatus[0]=="0"&&resultForSwitchStatus[1]=="0")
							{
								//暂停
								switchStatusIndex2=1;
							}
							else
							if(resultForSwitchStatus[0]=="1"&&resultForSwitchStatus[1]=="0")
							{
								//拉开
								switchStatusIndex2=0;
							}
							//根据按钮开关值以及设备类型确定设备图片的路径
							changeImagePath(switchStatusIndex2,deviceType,image);

							//清除针对之前开关状态设置的id
							for(var i=0;i<$(btnGroup).children("button").length;i++)
							{
								$(btnGroup).children("button").eq(i).attr("id",'');
							}

							//为指定button索引的值设置id
							$(btnGroup).children("button").eq(switchStatusIndex2).attr("id",'currentStatus');
						}

						//普通的单个开关
						else
						{
							//获取到被选项的value值
							selectedValue2=this.options[this.options.selectedIndex].value;
							//获取到被选项的文本值
							var selectedText=this.options[this.options.selectedIndex].innerHTML;
							//开关状态值
							var data={
								GreenHouseID:houseId
							};
							var msg=JSON.stringify(data);
							var result=getUpdatedDeviceSwitchValue(deviceType,selectedText,msg);
							var switchValue=result[0];
							//根据这个设备的Value,获取开关状态,若为0，状态为开
							if(switchValue=="0")
							{
								//改变图片的属性
								$(pSwitch).attr("src","imges/switchOff.png");
								$(pSwitch).attr("id","off");
							}
							else
							//状态为关
							if(switchValue=="1")
							{
								//改变图片的属性，
								$(pSwitch).attr("src","imges/switchOn.png");
								$(pSwitch).attr("id","on");
							}
							// 获取第一个设备的自动开启状态
							if(target[index].DeviceType!="补光灯")
							{
								var autoConfigValue=target[index].RemarkList[selectedValue2].AutoConfig;
								// 为"0"开启自动控制，复选框未选中
								if(autoConfigValue=="0")
								{
									$(checkBox).attr("checked",false);
								}
								// 为"1"开启自动控制，复选框选中
								else
								{
									$(checkBox).attr("checked",true);
								}
							}
							else
							{
								var autoConfigValue=target[index].RemarkList[selectedValue2].AutoConfig;
								if(autoConfigValue.split(".")[0]=="0")
								{
									$(checkBox).attr("checked",false);
									$(input1).val(autoConfigValue.split(".")[1]);
									$(input2).val(autoConfigValue.split(".")[2]);
								}
								else
								if(autoConfigValue.split(".")[0]=="1")
								{
									$(checkBox).attr("checked",true);
									$(input1).val(autoConfigValue.split(".")[1]);
									$(input2).val(autoConfigValue.split(".")[2]);
								}				
							}
							//根据按钮开关值以及设备类型确定设备图片的路径
							changeImagePath(switchValue,deviceType,image);
						}       	
					})
					// 更新自动开启开关（复选框）
					// 当复选框的选中状态发生变化时
					$(checkBox).click(function(){
						if($(this).is(":checked"))
						{
							// 对于补光灯
							if(target[index].DeviceType=="补光灯")
							{		
								var newAutoConfig="1."+$(input1).text()+"."+$(input2).text();
							}
							else
							{
								var newAutoConfig="1";
							}
						}
						else
						{
							// 对于补光灯
							if(target[index].DeviceType=="补光灯")
							{
								var newAutoConfig="0."+$(input1).text()+"."+$(input2).text();
							}
							else
							{
								var newAutoConfig="0";
							}
						}
						updateSwitchAutoConfig(houseId,$(selectEle).find("option:selected").text(),newAutoConfig,userId,checkBox);
					})
				}
			}
	});
}
//更新开关时局部刷新得到某个设备的开关值
//传入参数为：（1）设备类型 （2）设备的备注名（3）被点击的开关对象(4)所在大棚id字符串对象
function getUpdatedDeviceSwitchValue(deviceType,deviceRemark,activeHouseMsg)
{
	var switchValue=[];
	$.ajax({
		url: BaseUrl + "GetSwitchStateNow", //相对应的esb接口地址
		type: 'post',
		data:activeHouseMsg, //向服务器（接口）传递的参数
		dataType: "json",
		// 同步方式
		async:false,
		contentType: "application/json;charset=utf-8",
		success:function(data){
			var otg=data.GetSwitchStateNowResult;
			for(var i=0;i<otg.length;i++)
			{
				if(deviceType==otg[i].DeviceType)
				{
					for(var j=0;j<otg[i].RemarkList.length;j++)
					{
						if(otg[i].RemarkList[j].Remark==deviceRemark)
						{
							
							var obj={
								DeviceID:otg[i].RemarkList[j].DeviceID,
								Value:otg[i].RemarkList[j].Value
							};
							switchValue.push(obj);
						}
					}
				}
			}
			if(switchValue.length==2)
			{
				if(switchValue[0].DeviceID>switchValue.DeviceID)
				{

					//调换数组两个元素的位置
					var temp=switchValue[0];
					switchValue[0]=switchValue[1].Value;
					switchValue[1]=temp.Value;
				}
				else
				{
					switchValue[0]=switchValue[0].Value;
					switchValue[1]=switchValue[1].Value;
				}
			}
			else
			{
				switchValue=switchValue[0].Value;
			}
		}
	})
	return switchValue;
}
//开关控制部分的定时刷新函数
function timedRefresh()
{
	//清空之前内容
	$(".rightUl").text("");
	//获得当前大棚的id
	var houseId=getHouseId($("#active span").text());
	//获得用户id
	var userId=userId_G;
	switchConfig(houseId,userId);
}
//参数范围部分的定时刷新
function rangeTimedRefresh(){
	var houseIdNow=getHouseId($("#active span").text());
	var dataNow={GreenHouseID:houseIdNow};
	var msgNow=JSON.stringify(dataNow);
	getNormalRange(msgNow);
}
