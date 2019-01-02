var baseUrl = "http://211.149.245.105:8866/MonitorService.svc/webHttp/";
//登录验证
CheckLogin();
function CheckLogin() {
	if (sessionStorage.Name == undefined || sessionStorage.Password == undefined) {
		alert('您还没有登录，请登录账号！')
		window.location.href = "login.html?goAddress='setting.html'";
	}
}

//全局变量
//登录的用户名和密码
var data = {
	Name: sessionStorage.Name,
	Password: sessionStorage.Password
};
var msg = JSON.stringify(data);

// 创建全局变量存储大棚信息对象
var dapengInfoObj=getHouseInfo(msg);
// 全局变量存储用户类型
var userType_G=getOwnInfo(msg);
//获取权限内大棚的名字和id对象
var ownRights_G=getOwnRights(msg);

//获得登录用户的权限
//传入参数为登录的用户名和密码值msg
function getOwnRights(param) {
	//清空之前的内容
	$("#belongFarm option:not(#firstOption)").remove();

	//用来存放大棚id和大棚名字
	var obj = null;

	//调用接口
	$.ajax({
		url: baseUrl + "GetOwnRights",
		type: "post",
		data: param,
		async: false,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			obj = result.GetOwnRightsResult;
		}
	})
	return obj;
}
//获取个人信息函数,返回值是用户类型
function getOwnInfo(param) {
	var userType = "";
	//采用了同步方式
	$.ajax({
		url: baseUrl + "GetOwnInfo",
		type: "post",
		async: false,
		data: param,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			userType = result.GetOwnInfoResult[0].UserType;

		}
	})
	return userType;
}

/*------------------------用户管理函数-------------------------*/

//用户类型为管理员时调用接口函数
function getUserInfo(houseID, index, text) {
	//将原有内容清空
	$("#table tr:not(#tableHead)").remove();
	var houseName = "";
	var count = 1;
	var data1 = {

		GreenHouseID: houseID
	};
	var msg1 = JSON.stringify(data1);
	//获得用户列表
	$.ajax({
		url: baseUrl + "GetHouseUserInfo",
		type: "post",
		data: msg1,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			var obj = result.GetHouseUserInfoResult;
			var userId = "";
			//把用户信息放在表格
			for (var i = 0; i < obj.length; i++) {
				userId = obj[i].UserID;
				var table = document.getElementById('table');
				//建新行
				var newTr = table.insertRow();
				for (var j = 0; j < 6; j++) {
					var newTd = newTr.insertCell();
					switch (j) {
						case 0: newTd.innerHTML = i + 1; break;
						case 1: newTd.innerHTML = text; break;
						case 2: newTd.innerHTML = obj[i].RealName; break;
						case 3: newTd.innerHTML = obj[i].UserType; break;
						case 4: newTd.innerHTML = obj[i].Phone; break;
						case 5: newTd.innerHTML = ""; break;
					}
				}

			}

		}
	});
}
//超级管理员获取所有用户权限
function getAllUser(selectedFarm) {
	//清空之前的数据
	$("#table tr:not(#tableHead)").remove();
	//传递数据
	var data = {
		Name: sessionStorage.Name,
		Password: sessionStorage.Password
	};
	var msg = JSON.stringify(data);
	$.ajax({
		url: baseUrl + "GetAllUserInfo",
		type: "post",
		data: msg,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			var obj = result.GetAllUserInfoResult;
			var userId = "";
			//获取表格
			var table = document.getElementById('table');
			if (selectedFarm == "整个大棚") {
				for (var i = 0; i < obj.length; i++) {
					userId = obj[i].UserID;
					//创建新行
					var newTr = table.insertRow(i + 1);
					for (var j = 0; j < 6; j++) {
						var newTd = newTr.insertCell(j);
						switch (j) {
							case 0: newTd.innerHTML = i + 1; break;
							case 1: newTd.innerHTML = obj[i].HouseName; break;
							case 2: newTd.innerHTML = obj[i].RealName; break;
							case 3: newTd.innerHTML = obj[i].UserType; break;
							case 4: newTd.innerHTML = obj[i].Phone; break;
							case 5: newTd.innerHTML = "<button class='text-edit' onclick='Edit(0,this,\"" + userId + "\");'>编辑</button>"
							+ "<button class='text-delete' onclick='deleteRowUserManage(this);'>删除</button>"; break;
						}
					}

				}
			}
			else {
				var count = 1;
				//动态创建表格
				for (var i = 0; i < obj.length; i++) {
					if (obj[i].HouseName == selectedFarm) {

						userId = obj[i].UserID;
						//创建新行
						var newTr = table.insertRow();
						for (var j = 0; j < 6; j++) {
							var newTd = newTr.insertCell();
							switch (j) {
								case 0: newTd.innerHTML = count++; break;
								case 1: newTd.innerHTML = obj[i].HouseName; break;
								case 2: newTd.innerHTML = obj[i].RealName; break;
								case 3: newTd.innerHTML = obj[i].UserType; break;
								case 4: newTd.innerHTML = obj[i].Phone; break;
								case 5: newTd.innerHTML = "<button class='text-edit' onclick='Edit(0,this,\"" + userId + "\");'>编辑</button>"
									+ "<button class='text-delete' onclick='deleteRowUserManage(this);'>删除</button>"; break;
							}
						}
					}
				}
			}
		}
	})
}
//点击用户管理页面编辑按钮显示编辑窗口,编辑用户信息
//传入参数 selectName:大棚选择框的第一个选项，obj:点击的对象，userID:用户的id
function Edit(selectName, obj, userID) {
	//判断编辑框的类别
	if (selectName == 0) {
		//显示编辑框
		$(".editForm").show();

		//传递用户id
		var data1 = {
			UserID: userID
		};
		var msg1 = JSON.stringify(data1);
		//获取用户信息
		$.ajax({
			url: baseUrl + "GetUserInfo",
			type: "post",
			data: msg1,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				var otg = result.GetUserInfoResult;
				//把用户信息放到编辑框
				$(".editForm #name").text(otg[0].RealName);
				$(".editForm #gender").text(otg[0].Gender);
				$(".editForm #userName").text(otg[0].Name);
				$(".editForm #phoneNum").val(otg[0].Phone);
				$(".editForm #idCard").text(otg[0].IDNum);
				//判断用户类型
				switch (otg[0].UserType) {
					case "游客": $(".editForm .user-type option:eq(0)").attr("selected", "selected"); break;
					case '管理员': $(".editForm .user-type option:eq(1)").attr("selected", "selected"); break;
					case '超级管理员': $(".editForm .user-type option:eq(2)").attr("selected", "selected"); break;
				}

				//根据性别设置用户头像
				if (otg[0].Gender == "女") {
					$(".editForm #userImage").attr("src", "imges/female.png");
				}
				else {
					$(".editForm #userImage").attr("src", "imges/manImage.png");
				}
				//点击更新按钮时
				$(".update").unbind("click").click(function(){});
				//如果用户类型选择框的值发生了变化，则更新用户信息
				$(".update").click(function () {
					// if ($(".user-type option:selected").text() != otg[0].UserType) {
						//获得要更新的值
						var dataForUpdate = {
							UserID: otg[0].UserID,
							Phone:$("#edit #phoneNum").val(),
							UserType: $(".user-type option:selected").text()
						};
						var msgForUpdate = JSON.stringify(dataForUpdate);
						//调用更新接口
						$.ajax({
							url: baseUrl + "UpdateUserInfo",
							type: "post",
							data: msgForUpdate,
							dataType: "json",
							contentType: "application/json;charset=utf-8",
							success: function (result) {
								var otg = result.UpdateUserInfoResult;
								// 如果更新成功
								if (otg)
								{
									// 弹窗提示
									alert("更新成功！");
									//隐藏编辑窗口
									$(".editForm").hide();
									//获取更新后的用户信息
									getAllUser($("#user-select-farm option:selected").text());
								}
								//更新失败
								else
								{
									alert("更新失败！");
								}

							}
						})
					// }
				})

			}
		})
		//获取用户权限，显示已负责的大棚列表
		var dataForShowHavedFarm = {
			UserID: userID
		};
		var msgForShowHavedFarm = JSON.stringify(dataForShowHavedFarm);
		$.ajax({
			url: baseUrl + "GetUserRights",
			type: "post",
			data: msgForShowHavedFarm,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				var obj = result.GetUserRightsResult;
				var table = $("#farm-list-table");
				//创建表格显示权限内大棚
				for (var i = 0; i < obj.length; i++) {
					//建新行
					var newTr = $("<tr></tr>");
					$(table).append(newTr);
					//建新列
					for (var j = 0; j < 2; j++) {
						var newTd = $("<td></td>");
						$(newTr).append(newTd);
						switch (j) {
							case 0: $(newTd).text(obj[i].HouseName); break;
							case 1: $(newTd).html("<span class='deleteText'>删除</span>"); break;
						}
					}

				}
				//解除绑定，避免弹窗弹出多次
				$(".deleteText").unbind("click").click(function(){});
				//删除用户权限
				$(".deleteText").click(function () {

					//把点击的对象赋值给一个变量
					var clickedObj = $(this);

					//获取要删除的大棚名字
					var houseName2 = $(this).parent().parent().children("td:eq(0)").text();
					// 获取大棚id
					var houseId2 =getHouseId(houseName2);
					var data3 = {
						UserID: userID,
						GreenHouseID: houseId2
					}

					var msg3 = JSON.stringify(data3);
					//调用接口删除权限
					$.ajax({
						url: baseUrl + "DeleteUserRights",
						type: "post",
						data: msg3,
						dataType: "json",
						contentType: "application/json;charset=utf-8",
						success: function (result) {
							var otg = result.DeleteUserRightsResult;
							//成功
							if (otg) {
								// 弹窗提示
								alert("删除权限成功！");
								//删除这一行
								$(clickedObj).parent().parent().remove();
								getAllUser("整个大棚");
							}
							//失败
							else
							{
								alert("删除权限失败！");
							}
						}
					})
				})

			}
		})

		//解除绑定，避免弹窗多次弹出
		$(".btnAdd").unbind("click").click(function(){});
		//当点击添加按钮时插入用户权限
		$(".btnAdd").click(function () {

			//获取要添加的大棚
			var houseName = $(".newfarm option:selected").text();
			var houseId =getHouseId(houseName);
			var data2 = {
				UserID: userID,
				GreenHouseID: houseId
			};
			var msg2 = JSON.stringify(data2);

			//调用插入用户权限接口
			$.ajax({
				url: baseUrl + "InsertUserRights",
				type: "post",
				data: msg2,
				dataType: "json",
				contentType: "application/json;charset=utf-8",
				success: function (result) {
					var otg = result.InsertUserRightsResult;
					//成功插入用户权限
					if (otg) {

						//添加一行记录
						var table = document.getElementById('farm-list-table');

						var tr1 = table.insertRow();//建立空行
						var tr2 = table.insertRow();

						//设置空格行样式
						tr1.style.height = "10px";
						tr1.style.marginTop = "10px";

						tr2.style.marginTop = "10px";
						tr2.style.height = "20px";
						tr2.style.border = "1px solid #7B7B7B";

						//插入新列
						var td1 = tr2.insertCell();
						var td2 = tr2.insertCell();

						//填充表格内容
						td1.innerHTML = $(".newfarm option:selected").text();
						td2.innerHTML = "<span class='deleteText'>删除</span>";
						td2.style.color = "#3BC0FF";
						//点击后，
						td2.onclick = function () {
							$(td2).parent().remove();
						}

						//当点击删除时删除用户权限

						$(".deleteText").click(function () {
							//获取要删除的大棚名字
							var houseName2 = $(this).parent().parent().children("td:eq(0)").text();
							var houseId2 = "";
							//转换成大棚id
							switch (houseName2) {
								case "一号大棚": houseId2 = "House1"; break;
								case "二号大棚": houseId2 = "House2"; break;
								case "三号大棚": houseId2 = "House3"; break;
							}
							var data3 = {
								UserID: userID,
								GreenHouseID: houseId2
							}

							var msg3 = JSON.stringify(data3);
							//调用接口删除权限
							$.ajax({
								url: baseUrl + "DeleteUserRights",
								type: "post",
								data: msg1,
								dataType: "json",
								contentType: "application/json;charset=utf-8",
								success: function (result) {
									var otg = result.DeleteUserRightsResult;
									if(otg)
									{
										alert("成功删除对此大棚的权限！");
									}
									else
									{
										alert("删除用户的权限失败！");
									}
								}
							})
						})

						// 更新用户管理面板用户信息
						getAllUser($("#user-select-farm option:selected").text());

					}
					else {
						alert("该大棚已在用户负责范围");
					}

				}
			})
		})
		// 再次打开编辑框，清除之前的表格内容
		$("#farm-list-table").text("");
	}

}
//用户管理表格的删除按钮点击触发函数
// 参数obj表示点击的对象
function deleteRowUserManage(obj) {
	//在删除前弹出提示框
	$("#userManage-deleteForm").show();

	//要删除的行元素
	var targetRow = obj.parentNode.parentNode;
	// 解除绑定
	$("#deleteSure").unbind("click").click(function (){});
	// 点击确认删除按钮
	$("#deleteSure").click(function () {

		$.ajax({
			url: baseUrl + "GetAllUserInfo",
			type: "post",
			data: msg,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				var otg = result.GetAllUserInfoResult;
				for (var i = 0; i < otg.length; i++) {
					if (otg[i].RealName == $(targetRow).find("td").eq(2).text()) {
						var targetUserId = otg[i].UserID;
					}
				}
				var targetData = {
					Name: data.Name,
					Password: data.Password,
					UserID: targetUserId
				};
				var targetMsg = JSON.stringify(targetData);
				// 删除用户
				$.ajax({
					url: baseUrl + "DeleteUser",
					type: "post",
					data: targetMsg,
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					success: function (result) {
						//若删除成功
						if (result.DeleteUserResult) {
							// 弹窗提示
							alert("成功删除此用户！");
							//隐藏删除框
							$("#userManage-deleteForm").hide();
							//获得当前大棚选择框选中的值
							var currentHouseName=$("#user-select-farm option:selected").text();
							//获得新的用户信息
							getAllUser(currentHouseName);
						}
						// 删除失败
						else {
							alert("删除用户失败！");
						}
					}
				});
			}
		});
	});
	$("#deleteCancle,#closeIcon").click(function () {
		$("#userManage-deleteForm").hide();
	});
}

/*---------------------设备管理函数-----------------------*/

//获得设备列表
//传入参数houseName:选中大棚的名字,type:用户类型
function getDeviceList(houseName,type) {
	//清空原有的内容
	$("#equip-table1 tr:not(#equipTableHead)").remove();
	// 根据大棚名字获取大棚id
	for(var i=0;i<ownRights_G.length;i++)
	{
		if(ownRights_G[i].HouseName==houseName)
		{
			var selectedHouseId=ownRights_G[i].GreenHouseID;
		}
	}
	
	var data2 = {
		GreenHouseID:selectedHouseId,
		UserType: type
	};
	var msg2 = JSON.stringify(data2);
	//获得设备列表
	$.ajax({
		url: baseUrl + "GetDeviceList",
		type: "post",
		data: msg2,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			var obj = result.GetDeviceListResult;
			var table1 = document.getElementsByClassName('equip-farm-table')[0];
			//获取大棚名字
			var houseName =$("#equip-select-farm option:selected").text();

			for (var i = 0; i < obj.length; i++) {

				var newTr1 = table1.insertRow(i + 1);
				for (var j = 0; j < 8; j++) {
					var newTd1 = newTr1.insertCell(j);
					switch (j) {
						case 0: newTd1.innerHTML = i + 1; break;
						case 1: newTd1.innerHTML = houseName; break;
						case 2: newTd1.innerHTML = obj[i].DeviceBoxID; break;
						case 3: newTd1.innerHTML = obj[i].DeviceID; break;
						case 4: newTd1.innerHTML = obj[i].DeviceType; break;
						case 5: newTd1.innerHTML = obj[i].Remark; break;
						case 6: newTd1.innerHTML = obj[i].State;
							if (obj[i].State == "已停用") {
								newTd1.style.color = "#ff0000";
							} break;
						case 7: switch (obj[i].State) {
								case "已启用": newTd1.innerHTML = "<button class='stopuse' onclick='stopUse(this);'>停用</button><button class='AssignDevice-text-edit'>编辑</button><button class='text-delete' onclick='deleteRowEquipManage(this);'>删除</button>";
									$(".stopuse").css("color", "#666666"); break;
								case "已停用": newTd1.innerHTML = "<button class='startup' onclick='stopUse(this);'>启用</button><button class='AssignDevice-text-edit'>编辑</button><button class='text-delete' onclick='deleteRowEquipManage(this);'>删除</button>";
									$(".startup").css('color', "#009900"); break;
							} break;
					}

				}
			}
			//为编辑框添加点击事件
			$(".equip-farm-table .AssignDevice-text-edit").click(function () {

				//显示编辑框
				$("#equip-table-edit").show();
				//获得这一行
				var trParent = $(this).parent().parent();

				//获得设备类型
				var deviceType = $(this).parent().parent().find("td:eq(4)").text();

				// 获得控制柜编号
				var boxId= $(this).parent().parent().find("td:eq(2)").text();

				//对于已分配设备列表，更改编辑框的设备归属元素
				if ($("#equip-select-farm option:selected").text() != "未分配") {
					//元素替代
					$("#belongFarm").replaceWith("<span id='belongFarm'></span>");
					//设备归属值为选择框选中的值
					$("#belongFarm").text($("#equip-select-farm option:selected").text());
				}
				//把这一行的相关内容放到编辑框里
				$("#equip-table-edit #deviceId").text($(trParent).find("td:eq(3)").text());
				$("#equip-table-edit #deviceType").text($(trParent).find("td:eq(4)").text());
				$("#equip-table-edit #remark").text($(trParent).find("td:eq(5)").text());
				$("#equip-table-edit #deviceState").text($(trParent).find("td:eq(6)").text());

				// 添加控制柜编号
				// 清除之前的内容
				$("#equip-table-edit #boxId").text("");
				// 添加新的选项
				$("#equip-table-edit #boxId").append($("<option>"+boxId+"</option>"));

			})
		}
	});
}
//获得所有未分配的设备列表
function getUnAssignedDeviceList(houseName) {

	//清空原有的内容
	$("#equip-table1 tr:not(#equipTableHead)").remove();

	var data1 = {};
	var msg1 = JSON.stringify(data1);
	$.ajax({
		url: baseUrl + "GetUnassignedDevice",
		type: "post",
		dataType: "json",
		data: msg1,
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			var obj1 = result.GetUnassignedDeviceResult;
			var table1 = document.getElementsByClassName('equip-farm-table')[0];
			for (var i = 0; i < obj1.length; i++) {

				var newTr1 = table1.insertRow(i + 1);
				for (var j = 0; j < 8; j++) {
					var newTd1 = newTr1.insertCell(j);
					switch (j) {
						case 0: newTd1.innerHTML = i + 1; break;
						case 1: newTd1.innerHTML = houseName; break;
						case 2: newTd1.innerHTML = obj1[i].DeviceBoxID; break;
						case 3: newTd1.innerHTML = obj1[i].DeviceID; break;
						case 4: newTd1.innerHTML = obj1[i].DeviceType; break;
						case 5: newTd1.innerHTML = obj1[i].Remark; break;
						case 6: newTd1.innerHTML = obj1[i].State;
							if (obj1[i].State == "故障") {
								newTd1.style.color = "#ff0000";
							} break;
						case 7: newTd1.innerHTML = "<button class='UnassignDevice-text-edit' >编辑</button>"
							+ "<button class='text-delete' onclick='deleteRowEquipManage(this);'>删除</button>"; break;
					}

				}

			}

			//为编辑框添加点击事件
			$(".equip-farm-table .UnassignDevice-text-edit").click(function () {

				//显示编辑框
				$("#equip-table-edit").show();

				//获得行元素
				var trParent = $(this).parent().parent();
				//获得设备类型
				var deviceType = $(trParent).find("td:eq(4)").text();
				//将这一行有关信息放到编辑框里
				$("#equip-table-edit #deviceId").text($(trParent).find("td:eq(3)").text());
				$("#equip-table-edit #deviceType").text($(trParent).find("td:eq(4)").text());
				$("#equip-table-edit #remark").text($(trParent).find("td:eq(5)").text());
				$("#equip-table-edit #deviceState").text($(trParent).find("td:eq(6)").text());

				//获得控制柜编号
				//清空之前的内容
				$("#boxId option").not("#firstOption").remove();

				//获得大棚列表
				var houseList = ownRights_G;
				//把大棚放到编辑框的大棚选择框里
				$("#belongFarm").replaceWith("<select id='belongFarm'><option id='firstOption' value=0>请选择归属大棚</option></select>")
				for (var i = 0; i < houseList.length; i++) {
					var newOption = $("<option ></option>")
					$(newOption).val(i + 1);
					$(newOption).text(houseList[i].HouseName);
					$("#belongFarm").append(newOption);
				}

				//获得归属大棚的选中项的value值
				var value = $("#belongFarm option:selected").val();
				//若没选中大棚，禁用更新按钮
				if (value == 0) {
					$("#updateForUnassignDevice").attr("disabled", true);
				}
				else {
					//启用更新按钮
					$("#updateForUnassignDevice").attr("disabled", false);
				}

				//归属大棚选项转换时
				$("#belongFarm").change(function () {

					//获得归属大棚的选中项的value值
					var value1 = $("#belongFarm option:selected").val();

					//获得选中的大棚名字
					var houseText=$("#belongFarm option:selected").text();
					for(var i=0;i<houseList.length;i++)
					{
						if(houseText==houseList[i].HouseName)
						{
							// 获得选中大棚的id
							var houseId=houseList[i].GreenHouseID;
						}
					}
					//若没选中大棚，禁用更新按钮
					if (value1 == 0) {
						$("#updateForUnassignDevice").attr("disabled", true);
					}
					else {
						//启用更新按钮
						$("#updateForUnassignDevice").attr("disabled", false);
					}
					//获得对应的大棚控制柜列表
					getBoxIDList(houseId,deviceType);

				})

				//解除绑定，避免弹窗多次弹出
				$("#updateForUnassignDevice").unbind("click").click(function(){});
				//点击更新按钮时，将未分配的大棚分配到已知大棚中
				$("#updateForUnassignDevice").click(function () {

					//获得选中的大棚名字
					var houseText=$("#belongFarm option:selected").text();
					for(var i=0;i<houseList.length;i++)
					{
						if(houseText==houseList[i].HouseName)
						{
							// 获得选中大棚的id
							var houseId=houseList[i].GreenHouseID;
						}
					}
					//控制柜编号
					var boxId=$("#boxId").find("option:selected").text();
					var dataForAssignDevice = {
						GreenHouseID: houseId,
						DeviceBoxID:boxId,
						DeviceID: $(trParent).find("td:eq(3)").text(),
						DeviceType: $(trParent).find("td:eq(4)").text(),
						Remark: $(trParent).find("td:eq(5)").text()
					};
					var msgForAssignDevice = JSON.stringify(dataForAssignDevice);
					//调用分配设备接口
					$.ajax({
						url: baseUrl + "AssignDevice",
						type: "post",
						data: msgForAssignDevice,
						dataType: "json",
						contentType: "application/json;charset=utf-8",
						success: function (result) {
							var otg = result.AssignDeviceResult;
							if (otg) {
								//弹出提示框
								alert("更新成功！");
								//隐藏编辑框
								$("#equip-table-edit").hide();
								//调用未分配设备列表函数
								getUnAssignedDeviceList("未分配");
							}
							else
							{
								alert(otg);
							}
						}
					})

				})

			})
		}
	});
}
// 设备管理表格的删除按钮点击触发函数
// 参数obj表示点击的对象
function deleteRowEquipManage(obj) {
	//判断表格类型
	var houseName = $(obj).parent().parent().children("td").eq(1).text();

	//要删除的行元素
	var targetRow = obj.parentNode.parentNode;
	//获取要删除的设备信息
	var deviceId = $(targetRow).find("td").eq(3).text();
	var deviceType = $(targetRow).find("td").eq(4).text();
	var state = $("#deviceState option:selected").text();
	var remark = $(targetRow).find("td").eq(5).text();
	for(var i=0;i<ownRights_G.length;i++)
	{
		if(ownRights_G[i].HouseName==houseName)
		{
			var houseId =ownRights_G[i].GreenHouseID ;
		}
	}
	
	//对于未分配的设备
	if (houseName == "未分配") {
		//在删除前弹出提示框
		$("#equipManage-deleteUnassignDevice").show();
		var dataForUnassigned = {
			DeviceID: deviceId,
			Remark: remark
		};
		var msgForUassigned = JSON.stringify(dataForUnassigned);
		// 解除绑定
		$("#deleteUnassignDeviceSure").unbind("click").click(function(){});
		//调用接口删除此未分配设备
		$("#deleteUnassignDeviceSure").click(function () {

			$.ajax({
				url: baseUrl + "DeleteDevice",
				type: "post",
				data: msgForUassigned,
				dataType: "json",
				contentType: "application/json;charset=utf-8",
				success: function (result) {
					
					// 如果删除成功
					if (result.DeleteDeviceResult) {
						//弹窗提示
						alert("移除设备成功！");
						// 隐藏删除框
						$("#equipManage-deleteUnassignDevice").hide();
						// 获得未分配设备列表
						getUnAssignedDeviceList("未分配");
		
					}
					// 删除失败
					else
					{
						alert("移除设备失败！");
					}
				}
			});

		});
	}
	else {
		//在删除前弹出提示框
		$("#equipManage-deleteForm").show();
		//移除设备要传递的数据
		var dataForRemoveDevice = {
			GreenHouseID: houseId,
			Remark: remark,
			State: state
		};
		var msgForRemoveDevice = JSON.stringify(dataForRemoveDevice);
		//点击确定按钮时调用接口移除设备
		$("#deleteDeviceSure").click(function () {

			$.ajax({
				url: baseUrl + "RemoveDevice",
				type: "post",
				data: msgForRemoveDevice,
				dataType: "json",
				contentType: "application/json;charset=utf-8",
				success: function (result) {
					// 如果删除成功
					if (result.RemoveDeviceResult) {
						// 弹窗提示
						alert("删除设备成功！");
						// 隐藏删除框
						$("#equipManage-deleteForm").hide();

						// //获得选择框的选项数量
						// var optionNum = $("#equip-select-farm option").length;
						// //获得当前选中值的索引
						// var currentIndex = $("#equip-select-farm option:selected").val();
						//获得用户的类型
						var userType = userType_G;
						
						//得到当前选择框的大棚
						var selectedHouseName=$("#equip-select-farm option:selected").text();
						
						//调用函数获得新的设备列表
						//传入参数:
						getDeviceList(selectedHouseName,userType);
					}
					// 删除失败
					else
					{
						alert("删除设备失败！");
					}
				}
			});

		});
	}


	$("#deleteDeviceCancle,#closeIcon-equip,#closeIcon-unassign-equip,#deleteUnassignDeviceCancle").click(function () {
		$("#equipManage-deleteForm").hide();
	});
}
//更新大棚设备的启停用状态函数
//参数obj是点击的对象
function stopUse(obj) {

	//获得目标行
	var tr = obj.parentNode.parentNode;
	//获得大棚id
	var houseName = $(tr).find("td:eq(1)").text();
	var houseId =getHouseId(houseName);

	//获得备注名
	var remark = $(tr).find("td:eq(5)").text();

	//获得状态值
	var state = $(tr).find("td:eq(6)").text();
	if (state == "已停用") {
		state = "已启用";
	}
	else {
		state = "已停用";
	}

	//定义传递给接口的数据
	var data = {
		GreenHouseID: houseId,
		Remark: remark,
		State: state
	};
	var msg = JSON.stringify(data);
	//调用更新设备启停用状态接口
	$.ajax({
		url: baseUrl + "UpdateDeviceState",
		type: "post",
		data: msg,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			var otg = result.UpdateDeviceStateResult;
			//如果更新结果为true
			if (otg)
			{	
				if (obj.innerHTML == "停用") {
					obj.innerHTML = "启用";
					obj.style.color = "#1AA21A";
					tr = obj.parentNode.parentNode;
					$(tr).find("td:eq(6)").text("已停用");
					$(tr).find("td:eq(6)").css("color", "#f00");
				}
				else if (obj.innerHTML == "启用") 
				{
					obj.innerHTML = "停用";
					obj.style.color = "#333333";
					var tr = obj.parentNode.parentNode;
					$(tr).find("td:eq(6)").text("已启用");
					$(tr).find("td:eq(6)").css("color", "#333333");
				}
			}
		}
	})

}
//获取控制柜列表函数
function getBoxIDList(houseId, deviceType) {
	//清空之前的内容
	$("#boxId").text("");

	var dataForBoxIDList = {
		GreenHouseID: houseId,
		DeviceType: deviceType
	};
	var msgForBoxIDList = JSON.stringify(dataForBoxIDList);
	//调用接口
	$.ajax({
		url: baseUrl + "GetBoxIDList",
		type: "post",
		data: msgForBoxIDList,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			var obj = result.GetBoxIDListResult;
			//获取控制柜列表select
			var boxId = $("#boxId");
			// 结果不为空
			if(obj.length>0)
			{
				for (var i = 0; i < obj.length; i++) {
					//创建新的option
					var newOption = $("<option value=i></option>");
					$(newOption).text(obj[i].DeviceBoxID);
					$(boxId).append(newOption);
				}
			}
			// 结果为空
			else
			{
				var newOption=$("<option>新建</option>");
				$(boxId).append(newOption);
				$(boxId).attr("disabled",true);
			}
			
		}
	})
}
//根据设备类型，设置不同的设备照片(用于设备管理中的编辑框)
function setDeviceImage(userType, state) {
	switch (userType) {
		case '顶窗':
			switch (state) {
				case '已启用': $("#deviceImage").attr("src", 'imges/dingchuang-open.png'); break;
				case '已停用': $("#deviceImage").attr("src", 'imges/dingchuang-close.png'); break;
			} break;
		case '侧窗':
			switch (state) {
				case '已启用': $("#deviceImage").attr("src", 'imges/cechuang-open.png'); break;
				case '已停用': $("#deviceImage").attr("src", 'imges/cechuang-close.png'); break;
			} break;
		case '光照强度':
		case '补光灯':
			switch (state) {
				case '已启用': $("#deviceImage").attr("src", 'imges/lux.png'); break;
				case '已停用': $("#deviceImage").attr("src", 'imges/lux.png'); break;
			} break;
		case '空气湿度':
		case '土壤湿度':
			switch (state) {
				case '已启用': $("#deviceImage").attr("src", 'imges/shidu.png'); break;
				case '已停用': $("#deviceImage").attr("src", 'imges/shidu.png'); break;
			} break;
		case '空气温度':
		case '土壤温度':
			switch (state) {
				case '已启用': $("#deviceImage").attr("src", 'imges/wendu.png'); break;
				case '已停用': $("#deviceImage").attr("src", 'imges/wendu.png'); break;
			} break;
		case '内保温':
			switch (state) {
				case '已启用': $("#deviceImage").attr("src", 'imges/neibaowen-open.png'); break;
				case '已停用': $("#deviceImage").attr("src", 'imges/neibaowen-close.png'); break;
			} break;
		case '内遮阳':
			switch (state) {
				case '已启用': $("#deviceImage").attr("src", 'imges/neizheyang-open.png'); break;
				case '已停用': $("#deviceImage").attr("src", 'imges/neizheyang-close.png'); break;
			} break;
		case '循环风机':
			switch (state) {
				case '已启用': $("#deviceImage").attr("src", 'imges/xunhuanfengji-open.png'); break;
				case '已停用': $("#deviceImage").attr("src", 'imges/xunhuanfengji-close.png'); break;
			} break;

	}
}

/*---------------------大棚信息函数-------------------*/
// 获取该用户拥有的大棚信息
//传入参数为登录的用户名和密码值msg
function getHouseInfo(param)
{
	var houseInfoObj=null;
	//调用接口,采用了同步方式
	$.ajax({
		url: baseUrl + "GetHouseInfo",
		type: "post",
		data:param,
		dataType: "json",
		// 同步方式
		async:false,
		contentType: "application/json;charset=utf-8",
		success: function (result) {
			houseInfoObj=result.GetHouseInfoResult;
		}
	})
	return houseInfoObj;
}
//编辑大棚信息
function editForDapengInfo(obj) {

	//显示编辑框
	$("#dapeng-info-table-edit").show();
	//获取用户类型
	var userType =userType_G;
	//获取所有大棚信息
	var obj1 =getHouseInfo(msg);
	console.log(obj1);
	//获得所在行
	var currentRow = $(obj).parent().parent();
	//获取点击对象索引值
	var index = parseInt($(currentRow).find("td:eq(0)").text()) - 1;

	//把相关信息填到编辑框里

	//大棚名字
	$("#dapeng-info-table-edit #farmName").val($(currentRow).find("td:eq(1)").text());

	//作物名
	$("#dapeng-info-table-edit #cropName").val($(currentRow).find("td:eq(2)").text());

	//种植时间
	$("#dapeng-info-table-edit #startTime").val(obj1[index].StartTime);

	//收获时间
	$("#dapeng-info-table-edit #endTime").val(obj1[index].EndTime);

	//适宜温度
	$("#dapeng-info-table-edit #minTemp").val(obj1[index].TempRange.slice(0, 2));
	$("#dapeng-info-table-edit #maxTemp").val(obj1[index].TempRange.slice(-4, -2));

	//适宜湿度
	$("#dapeng-info-table-edit #minMoist").val(obj1[index].MoistRange.slice(0, 2));
	$("#dapeng-info-table-edit #maxMoist").val(obj1[index].MoistRange.slice(-3, -1));

	// 解除绑定
	$(".updateDapengInfo").unbind("click").click(function(){});
	//更新大棚信息
	$(".updateDapengInfo").click(function (event) {
		//获取更新的数据
		var parentDiv = $(this).parent().parent();

		var houseName = $(parentDiv).find("#farmName").val();
		var objHouseInfo = getHouseInfo(msg);
		var houseID = objHouseInfo[index].GreenHouseID;
		var cropName = $(parentDiv).find("#cropName").val();
		var startTime = $(parentDiv).find("#startTime").val();
		var endTime = $(parentDiv).find("#endTime").val();
		var tempRange = $(parentDiv).find("#minTemp").val() + "°C~" + $(parentDiv).find("#maxTemp").val() + "°C";
		var moistRange =$(parentDiv).find("#minMoist").val() + "%~" + $(parentDiv).find("#maxMoist").val() + "%";

		var data1 = {
			GreenHouseID: houseID,
			HouseName: houseName,
			CropName: cropName,
			StartTime: startTime,
			EndTime: endTime,
			TempRange: tempRange,
			MoistRange: moistRange,
			cropPic: "1"
		};
		console.log(data1);
		var msg1 = JSON.stringify(data1);
		//调用更新接口
		$.ajax({
			url: baseUrl + "UpdateCropInfo",
			type: "post",
			data: msg1,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				var updateResult = result.UpdateCropInfoResult;
				console.log(updateResult);
				if (updateResult == "成功") {
					// 隐藏编辑框
					$("#dapeng-info-table-edit").hide();
					// 弹出提示成功窗口
					alert("更新成功！");
					//清空之前的内容
					$("#dapeng-info-table1 tr:not(#tableHeadFarm)").remove();
					var newHouseInfo = getHouseInfo(msg);
					// 大棚信息，创建表格
					var table=document.getElementById('dapeng-info-table1');
					for(var j=0;j<newHouseInfo.length;j++)
					{
						//插入新行
						var newTr=table.insertRow();

						for(var k=0;k<6;k++)
						{	
							//创建列，为每列添加不同内容
							var newTd=newTr.insertCell(k);
							switch(k)
							{
								case 0:newTd.innerHTML=j+1;break;
								case 1:newTd.innerHTML=newHouseInfo[j].HouseName;break;
								case 2:newTd.innerHTML=newHouseInfo[j].CropName;break;
								case 3:newTd.innerHTML=newHouseInfo[j].UserName;break;
								case 4:newTd.innerHTML=newHouseInfo[j].Status;
										if(newHouseInfo[j].Status=="异常")
										{
											newTd.style.color="#ff0000";
										} break;
								case 5: if(userType=="超级管理员")
										{
											newTd.innerHTML="<button class='dapengInfo-text-edit' onclick='editForDapengInfo(this)'>编辑</button>"
											+"<button class='text-delete' onclick='deleteRowHouseInfo(this);'>删除</button>";
										}
										else
										{
											newTd.innerHTML="<button class='dapengInfo-text-edit' onclick='editForDapengInfo(this)'>编辑</button>";
										} break;
							}
						}	
					}
				}
				else {
					// 弹出提示成功窗口
					alert(updateResult);
				}
			}
		});

	})

}
//删除大棚
// 参数obj表示点击的对象
function deleteRowHouseInfo(obj) {
	//弹出删除框
	$("#dapengInfo-deleteFarm").show();
	//获得大棚名字
	var houseName = $(obj).parent().parent().find("td").eq(1).text();

	var data1 = {
		Name: data.Name,
		Password: data.Password,
		HouseName: houseName
	};
	var msg1 = JSON.stringify(data1);
	// 解除对点击事件的绑定
	$("#deleteFarmSure").unbind("click").click(function(){});
	//点击确定按钮时调用接口
	$("#deleteFarmSure").click(function () {
		$.ajax({
			url: baseUrl + "DeleteHouse",
			type: "post",
			data: msg1,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				var otg = result.DeleteHouseResult;
				//若删除成功
				if (otg == "删除成功！") {
					// 弹窗提示
					alert("删除大棚成功！");
					// 窗口隐藏
					$("#dapengInfo-deleteFarm").hide();
					//清除之前的表格内容
					$("#dapeng-info-table1 tr:not(#tableHeadFarm)").remove();
					// 显示更新后的大棚信息
					var newHouseInfo = getHouseInfo(msg);
					// 大棚信息，创建表格
					var table=document.getElementById('dapeng-info-table1');
					for(var j=0;j<newHouseInfo.length;j++)
					{
						//插入新行
						var newTr=table.insertRow();

						for(var k=0;k<6;k++)
						{	
							//创建列，为每列添加不同内容
							var newTd=newTr.insertCell(k);
							switch(k)
							{
								case 0:newTd.innerHTML=j+1;break;
								case 1:newTd.innerHTML=newHouseInfo[j].HouseName;break;
								case 2:newTd.innerHTML=newHouseInfo[j].CropName;break;
								case 3:newTd.innerHTML=newHouseInfo[j].UserName;break;
								case 4:newTd.innerHTML=newHouseInfo[j].Status;
										if(newHouseInfo[j].Status=="异常")
										{
											newTd.style.color="#ff0000";
										} break;
								case 5:
										newTd.innerHTML="<button class='dapengInfo-text-edit' onclick='editForDapengInfo(this)'>编辑</button>"
										+"<button class='text-delete' onclick='deleteRowHouseInfo(this);'>删除</button>";break;
							}
						}	
					}
				}
				//删除失败
				else {
					alert("删除大棚失败！");
				}

			}
		})
	})

}
// 获得大棚id函数
function getHouseId(houseName){
	var houseId=null;
	for(var i=0;i<dapengInfoObj.length;i++)
	{
		if(houseName==dapengInfoObj[i].HouseName)
		{
			houseId=dapengInfoObj[i].GreenHouseID;
		}
	}
	return houseId;
}


window.onload = function () {


	/*------------导航栏切换----------------*/
	var contentList = document.getElementById('content-list');
	var aP = contentList.getElementsByTagName('p');
	var aDiv = document.getElementsByClassName('show-content');
	for (var i = 0; i < aP.length; i++) {
		aP[i].index = i;
		aP[i].onclick = function () {
			for (var j = 0; j < aP.length; j++) {
				aP[j].className = "";
				aDiv[j].style.display = "none";
			}
			this.className = "active";
			aDiv[this.index].style.display = "block";
		}
	}

	/*---------获取用户和设备-----------*/

	//调用函数，获取用户类型
	var userType =userType_G;
	//用户为"普通管理员"时
	if (userType == "管理员") {
		
		// 添加大棚选择框的值
		var obj=dapengInfoObj;
		for(var i=0;i<obj.length;i++)
		{
			var newOption1=$("<option></option>");
			$(newOption1).text(obj[i].HouseName);
			var newOption2=$("<option></option>");
			$(newOption2).text(obj[i].HouseName);
			$("#user-select-farm").append(newOption1);
			$("#equip-select-farm").append(newOption2);
		}
		// 用户管理初始显示
		// 隐藏注册新用户、添加新用户按钮和注册新大棚按钮
		$("#btn-log,#btn-add,#btn-log-farm").hide();
		//获取选中项的value值
		var selectedValue = $("#user-select-farm").children("option:selected").val();
		//获取选中项的文本值
		var selectedText = $("#user-select-farm").find("option:selected").text().slice(0, 4);
		// 获取选中大棚的用户
		var houseId=getHouseId(selectedText);
		getUserInfo(houseId, selectedValue, selectedText);

		//用户管理大棚选项改变时
		$("#user-select-farm").change(function () {
		
			//获取选中项的value值
			var selectedValue = $("#user-select-farm").children("option:selected").val();
			//获取选中项的文本值
			var selectedText = $("#user-select-farm").children("option:selected").text().slice(0, 4);

			//调用函数，获取用户
			var houseId=getHouseId(selectedText);
			getUserInfo(houseId, selectedValue, selectedText);
		});

		//设备管理初始状态
		//获得选择项的大棚名字值
		var selectedValueEquip = $("#equip-select-farm option:selected").text();
		//获取某大棚的设备列表
		getDeviceList(selectedValueEquip,userType);

		//设备管理选择项改变时
		$("#equip-select-farm").change(function () {
			//获取选中大棚名字
			var selectedValue = $("#equip-select-farm option:selected").text();
			//否则获取某大棚的设备列表
			getDeviceList(selectedValue,userType);
		})

		// 去除设置页面的一些功能
		//用户管理区域隐藏注册新用户和添加新用户按钮
		$("#user-manage-show").find("#btn-add,#btn-log").hide();
		//设备管理区域隐藏注册新设备按钮
		$("#equip-manage-show").find("#btn-log-equip").hide();
		//大棚信息区域隐藏注册新大棚按钮
		$("#dapeng-info-show").find("#btn-log-farm").hide();

		// 大棚信息，创建表格
		var table=document.getElementById('dapeng-info-table1');
		for(var j=0;j<obj.length;j++)
		{
			//插入新行
			var newTr=table.insertRow();

			for(var k=0;k<6;k++)
			{	
				//创建列，为每列添加不同内容
				var newTd=newTr.insertCell(k);
				switch(k)
				{
					case 0:newTd.innerHTML=j+1;break;
					case 1:newTd.innerHTML=obj[j].HouseName;break;
					case 2:newTd.innerHTML=obj[j].CropName;break;
					case 3:newTd.innerHTML=obj[j].UserName;break;
					case 4:newTd.innerHTML=obj[j].Status;
							if(obj[j].Status=="异常")
							{
								newTd.style.color="#ff0000";
							} break;
					case 5: newTd.innerHTML="<button class='dapengInfo-text-edit' onclick='editForDapengInfo(this)'>编辑</button>";
							break;
				}
			}	
		}
	}

	// 用户为"超级管理员"时
	else if(userType == "超级管理员") 
	{
		// 添加"整个大棚","未分配"选项
		var userOption = $("<option value=0 selected>整个大棚</option>");
		var equipOption = $("<option value=0 selected>未分配</option>");
		$("#user-select-farm").append($(userOption));
		$("#equip-select-farm").append($(equipOption));

		// 添加大棚选择项
		var obj=dapengInfoObj;
		for(var i=0;i<obj.length;i++)
		{
			// 用户管理大棚选择框
			var newOption1=$("<option></option>");
			$(newOption1).text(obj[i].HouseName);
			$("#user-select-farm").append(newOption1);
			// 用户管理编辑窗口的大棚选择框
			var newOption2=$("<option></option>");
			$(newOption2).text(obj[i].HouseName);
			$("#edit .newfarm").append(newOption2);
			// 设备管理大棚选择框
			var newOption3=$("<option></option>");
			$(newOption3).text(obj[i].HouseName);
			$("#equip-select-farm").append(newOption3);
			
			
			
		}
		// 获取所有大棚的用户
		getAllUser("整个大棚");

		// 在用户管理区，大棚选项是整个大棚时隐藏添加新用户按钮
		if($("#user-select-farm option:selected").text()=="整个大棚")
		{
			$("#btn-add").hide();
		}

		//选项改变时
		$("#user-select-farm").change(function () {
	
			// 在用户管理区，大棚选项是整个大棚时隐藏添加新用户按钮
			if($("#user-select-farm option:selected").text()=="整个大棚")
			{
				$("#btn-add").hide();
			}
			else
			{
				$("#btn-add").show();	
			}
			//获取选中项的value值
			var selectedValue = $("#user-select-farm").children("option:selected").val() - 1;
			//获取选中项的文本值
			var selectedText = $("#user-select-farm").find("option:selected").text().slice(0, 4);
			//清空表格内容
			$("#table tr:not(#tableHead)").remove();
			//获取所有用户
			getAllUser(selectedText);

		});

		//设备管理	
		//获取未分配大棚的设备列表
		getUnAssignedDeviceList("未分配");
		//设备管理选择项改变时
		$("#equip-select-farm").change(function () {
			//获取选中大棚名字
			var selectedValue = $("#equip-select-farm option:selected").text();

			//若切换到“未分配”项
			if (selectedValue == "未分配") {
				//调用函数显示未分配设备
				getUnAssignedDeviceList("未分配");
			}
			//否则获取某大棚的设备列表
			else {
				getDeviceList(selectedValue, userType);
			}

		})

		// 大棚信息，创建表格
		var table=document.getElementById('dapeng-info-table1');
		for(var j=0;j<obj.length;j++)
		{
			//插入新行
			var newTr=table.insertRow();

			for(var k=0;k<6;k++)
			{	
				//创建列，为每列添加不同内容
				var newTd=newTr.insertCell(k);
				switch(k)
				{
					case 0:newTd.innerHTML=j+1;break;
					case 1:newTd.innerHTML=obj[j].HouseName;break;
					case 2:newTd.innerHTML=obj[j].CropName;break;
					case 3:newTd.innerHTML=obj[j].UserName;break;
					case 4:newTd.innerHTML=obj[j].Status;
							if(obj[j].Status=="异常")
							{
								newTd.style.color="#ff0000";
							} break;
					case 5:if(userType=="超级管理员")
							{
								newTd.innerHTML="<button class='dapengInfo-text-edit' onclick='editForDapengInfo(this)'>编辑</button>"
								+"<button class='text-delete' onclick='deleteRowHouseInfo(this);'>删除</button>";
							}
							else
							{
								newTd.innerHTML="<button class='dapengInfo-text-edit' onclick='editForDapengInfo(this)'>编辑</button>";
							}break;
				}
			}	
		}
	}

	/*-------注册新用户功能-----------*/

	//为用户名输入框设置正则表达式
	var patt1 = /^\w+$/;
	//为手机号输入框设置正则表达式
	var patt2 = /\d{11}/;
	//验证必填项是否有值函数
	function validate_required(params) {
		for (var i = 0; i < params.length; i++) {
			if (params[i] == "") { return false; break; }
			else continue;
		}
		return true;
	}
	//用户名输入值是否符合正则表达式验证
	$("#inputUserName").blur(function () {

		if (patt1.test($("#inputUserName").val()) == false) {
			$("#userNameTip").text("格式有误,请选用英文、数字或英文数字组合!");
		}
		else {
			$("#userNameTip").text("格式正确");
		}
	});
	//手机号输入值是否符合正则表达式验证
	$("#phoneNum").blur(function () {

		if (patt2.test($("#phoneNum").val()) == false) {
			$("#phoneTip").text("格式有误");
		}
		else {
			$("#phoneTip").text("格式正确");
		}
	});
	//当点击确认按钮时，如果验证通过，将各项值传到服务器注册一个用户
	$(".log-sure").click(function () {

		//姓名输入框的值
		var inputName = $("#nameInput").val();
		//性别选择框值
		var sexSelect = $("#sexSelect option:selected").text();
		//用户名值
		var userName = $("#inputUserName").val();
		//密码值
		var password = $("#pwd").val();
		//手机号
		var phoneNum = $(this).parent().parent().parent().find("#phoneNum").val();
		//身份证号
		var idCard = $("#inputCard").val();
		//用户类型
		var userType = $("#selectUserType option:selected").text();
		//所有必填项的值放在数组里
		var requireArr = [inputName, userName, password, phoneNum, idCard];
		var avatarID = "";
		if (sexSelect == "女") {
			avatarID = "F001";
		}
		else {
			avatarID = "M001";
		}

		//注册新用户数据接口
		var addData = {
			Name: userName,
			Password: password,
			RealName: inputName,
			Phone: phoneNum,
			IDNum: idCard,
			UserType: userType,
			Gender: sexSelect,
			AvatarID: avatarID
		};
		var addMsg = JSON.stringify(addData);
		$.ajax({
			url: baseUrl + "RegNewUser",
			type: "post",
			data: addMsg,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				//注册成功,提示并隐藏注册窗口
				if (result.RegNewUserResult) {
					alert("注册新用户成功!");
					$("#reg-new-user").hide();
					//获取更新后的整个大棚用户
					getAllUser("整个大棚");
				}
			}
		});
	});

	/*-------添加新用户到大棚功能----------*/

	//点击添加新用户弹出添加界面
	$("#btn-add").click(function () {
		//如果选中项是整个大棚，不能添加新用户
		if ($("#user-select-farm option:selected").text() == "整个大棚") {
			$("#add-new-user").hide();
			// 弹窗提示
			alert("请选择要添加到的大棚！");
		}
		else {
			//当点击添加新用户按钮时，显示添加窗口
			$("#add-new-user").show();
		}

	})
	//点击关闭和取消按钮时清空输入框的值，弹窗隐藏
	$("#button #btn-cancel,#add-new-user .log-close").click(function () {
		$("#add-new-user").hide();
		$("#name input").val("");
		$("#phone input").val("");
		$("#searchResultTable tr").not("#tableHead").remove();
		$("#searchResultTable").hide();
	})
	//点击搜索按钮时
	$("#search").click(function () {
		//获得输入框的值
		var userName1 = $("#name input").val();
		var phoneNum1 = $("#phone input").val();

		//传递数据
		var searchData = {
			RealName: userName1,
			Phone: phoneNum1
		};
		var searchMsg = JSON.stringify(searchData);
		$.ajax({
			url: baseUrl + "SearchUserInfo",
			type: "post",
			data: searchMsg,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				var obj = result.SearchUserInfoResult;
				//显示表头
				$("#searchResultTable tr th").show();
				//动态创建表格显示搜索到的信息
				for (var i = 0; i < obj.length; i++) {
					var searchTable = document.getElementById('searchResultTable');
					//新建行
					var newTr = searchTable.insertRow(i + 1);
					if (i < obj.length) {
						for (var j = 0; j < 5; j++) {
							//新建列
							var newTd = newTr.insertCell(j);
							switch (j) {
								case 0: newTd.innerHTML = i + 1; break;
								case 1: newTd.innerHTML = obj[i].RealName; break;
								case 2: newTd.innerHTML = obj[i].UserType; break;
								case 3: newTd.innerHTML = obj[i].Phone; break;
								case 4: newTd.innerHTML = "<input type='radio' name='select'>选择"; break;
							}
						}
					}

				}
				$("#searchResultTable").show();
				//点击添加按钮时
				$("#button #btn-add").click(function () {
					/*获得被选中的单选项*/
					var radio = $("input:radio[name='select']:checked");
					//判断单选项是否被选中
					if ($(radio).val() == "on") {
						var houseId = "";
						if ($("#user-select-farm option:selected").text() != "全部大棚") {
							//获得要添加到的大棚名字
							var selectedHouse = $("#user-select-farm option:selected").text();
							switch (selectedHouse) {
								case '一号大棚': houseId = "House1"; break;
								case '二号大棚': houseId = "House2"; break;
								case '三号大棚': houseId = "House3"; break;
							}
						}

						//把这个用户添加到对应的大棚里
						var addData2 = {
							UserID: obj[0].UserID,
							GreenHouseID: houseId
						};
						var addMsg2 = JSON.stringify(addData2);
						//赋予用户大棚权限
						$.ajax({
							url: baseUrl + "InsertUserRights",
							type: "post",
							data: addMsg2,
							dataType: "json",
							contentType: "application/json;charset=utf-8",
							success: function (result) {
								// 添加成功
								if (result) {
									// 弹框提示
									alert("添加成功!");
									//获得当前用户数
									var currentCount = $("#table").find("tr").length - 1;

									//将用户添加到表格中
									var newTr = $("<tr></tr>");
									$("#table").append(newTr);

									//添加列
									for (var i = 0; i < 6; i++) {
										var newTd = $("<td></td>");
										$(newTr).append(newTd);
										switch (i) {
											case 0: $(newTd).text(currentCount + 1); break
											case 1: $(newTd).text(selectedHouse); break;
											case 2: $(newTd).text(obj[0].RealName); break;
											case 3: $(newTd).text(obj[0].UserType); break;
											case 4: $(newTd).text(obj[0].Phone); break;
											case 5: $(newTd).html("<button class='text-edit' onclick='Edit(0,this,\"" + addData2.UserID + "\");'>编辑</button><button class='text-delete' onclick='deleteRowUserManage(this);'>删除</button>"); break;
										}
									}
								}
								//添加失败
								else {
									alert("添加新用户失败!");
								}

							}
						});
					}

				});
			}
		});
	});


	/*-------注册新设备功能------------------*/

	$("#newEquipAdd").click(function () {
		var deviceType = $("#deviceTypeSelect option:selected").text();
		var remark = $("#reg-new-equip #remark").val();
		var greenHouseName = $("#greenHouseSelect option:selected").text();
		var deviceBoxID = $("#deviceBoxSelect option:selected").text();
		var greenHouseID = "";
		switch (greenHouseName) {
			case "一号大棚": greenHouseID = "House1"; break;
			case "二号大棚": greenHouseID = "House2"; break;
			case "三号大棚": greenHouseID = "House3"; break;
			default: greenHouseID = greenHouseName; break;
		}
		var deviceData = {
			DeviceType: deviceType,
			Remark: remark,
			GreenHouseID: greenHouseID,
			DeviceBoxID: deviceBoxID
		};
		var deviceMsg = JSON.stringify(deviceData);
		$.ajax({
			url: baseUrl + "RegNewDevice",
			type: "post",
			data: deviceMsg,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				//如果注册成功
				if (result.RegNewDeviceResult) {
					// 弹窗提示
					alert("注册新设备成功!");
					// 隐藏注册窗口
					$("#reg-new-equip").hide();
					// 获取用户类型
					var userType=userType_G;
					// 获取大棚选择框选中的值
					var selectedHouse=$("#equip-select-farm option:selected").text();
					if(selectedHouse=="未分配")
					{
						//调用函数显示未分配设备
						getUnAssignedDeviceList("未分配");
					}
					else
					{
						// 显示当前大棚的设备列表
						getDeviceList(selectedHouse,userType);
					}
					
				}
				// 注册失败
				else {
					alert("注册新设备失败!");
				}

			}
		});

	});

	/*-------注册新大棚-------------*/
	/*当点击创建按钮时，提交信息*/
	$("#btn-create-farm").click(function () {
		var houseName = $("#reg-new-farm #farmName").val();
		var cropName = $("#plantType").val();
		var userName = data.Name;
		var startTime = $("#plantTime").val() ? $("#plantTime").val().slice(5, 7) + "/" + $("#plantTime").val().slice(-2) + "/" + $("#plantTime").val().slice(0, 4) : "";
		var endTime = $("#gainTime").val() ? $("#gainTime").val().slice(5, 7) + "/" + $("#gainTime").val().slice(-2) + "/" + $("#gainTime").val().slice(0, 4) : "";
		var tempRange = $("#reg-new-farm #minTemp").val() + "°C~" + $("#reg-new-farm #maxTemp").val() + "°C";
		var moistRange =$("#reg-new-farm #minMoist").val() + "%~" + $("#reg-new-farm #maxMoist").val() + "%";
		var cropPic = "1";
		if (houseName == null || houseName == "") {
			alert("大棚名不能为空！");
		}
		// data.Name
		var createFarmData = {
			HouseName: houseName,
			CropName: cropName,
			UserName:data.Name,
			StartTime: startTime,
			EndTime: endTime,
			TempRange: tempRange,
			MoistRange: moistRange,
			CropPic: cropPic
		};
		var createFarmMsg = JSON.stringify(createFarmData);
		$.ajax({
			url: baseUrl + "RegNewHouse",
			type: "post",
			data: createFarmMsg,
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function (result) {
				//若创建成功
				console.log(result.RegNewHouseResult);
				if (result.RegNewHouseResult == "创建成功！") {
					// 弹窗提示
					alert("创建大棚成功！");
					//窗口隐藏
					$("#reg-new-farm").hide();
					//清除之前的表格内容
					$("#dapeng-info-table1 tr:not(#tableHeadFarm)").remove();
					//显示更新后的大棚信息
					var newHouseInfo = getHouseInfo(msg);
					// 大棚信息，创建表格
					var table=document.getElementById('dapeng-info-table1');
					for(var j=0;j<newHouseInfo.length;j++)
					{
						//插入新行
						var newTr=table.insertRow();

						for(var k=0;k<6;k++)
						{	
							//创建列，为每列添加不同内容
							var newTd=newTr.insertCell(k);
							switch(k)
							{
								case 0:newTd.innerHTML=j+1;break;
								case 1:newTd.innerHTML=newHouseInfo[j].HouseName;break;
								case 2:newTd.innerHTML=newHouseInfo[j].CropName;break;
								case 3:newTd.innerHTML=newHouseInfo[j].UserName;break;
								case 4:newTd.innerHTML=newHouseInfo[j].Status;
										if(newHouseInfo[j].Status=="异常")
										{
											newTd.style.color="#ff0000";
										} break;
								case 5:
										newTd.innerHTML="<button class='dapengInfo-text-edit' onclick='editForDapengInfo(this)'>编辑</button>"
										+"<button class='text-delete' onclick='deleteRowHouseInfo(this);'>删除</button>";break;
							}
						}	
					}
				}
				// 创建失败
				else {
					alert(result.RegNewHouseResult);
				}
			}
		})
	});



	/*--------------------用户管理编辑窗口start--------------*/

	//点击关闭图标和取消按钮时，编辑窗口隐藏
	$(".edit-close,.editForm .div .cancel").click(function () {
		$(".editForm").hide();
		//清空列表中的内容
		$("#farm-list-table").text("");
	})

	/*--------------------在用户管理编辑窗口end--------------*/



	/*--------------------用户管理区注册新用户按钮弹窗Start----------*/
	//点击注册新用户时弹出注册界面
	$("#btn-log").click(function () {
		//当点击注册新用户按钮时，显示注册窗口
		$("#reg-new-user").show();
	})

	//在注册新用户窗口，点击取消按钮时，窗口隐藏
	$(".log-cancel").click(function () {
		$("#reg-new-user").hide();
	})
	//在注册窗口，点击关闭图标时，注册窗口隐藏
	$(".log-close").click(function () {
		$("#reg-new-user").hide();
		//数据清除
		$("#nameInput").val("");
		//用户名值
		$("#inputUserName").val("");
		//密码值
		$("#pwd").val('');
		//手机号
		$(this).parent().parent().parent().find("#phoneNum").val("");
		//身份证号
		$("#inputCard").val("");

	})
	/*----------------------用户管理区注册新用户按钮弹窗end----------*/

	/*---------------------设备管理区编辑按钮行为Start-------------*/
	$(".equip-close").click(function () {
		$("#equip-table-edit").hide();
	})

	//未分配表格的删除按钮弹窗关闭功能
	$("#closeIcon-unassign-equip,#deleteUnassignDeviceCancle").click(function () {
		$("#equipManage-deleteUnassignDevice").hide();
	})
	/*---------------------设备管理区编辑按钮行为End-------------*/


	/*------------------设备管理区注册新设备Start--------------------*/

	//点击注册新设备按钮时，显示注册窗口
	$("#btn-log-equip").click(function () {
		$("#reg-new-equip").css("display", "block");
	})

	//关闭窗口
	$(".equip-reg-close").click(function () {
		$("#reg-new-equip").hide();
	})
	$(".equip-reg-bottom button:eq(1)").click(function () {
		$("#reg-new-equip").hide();
	})
	/*------------------设备管理区注册新设备End--------------------*/


	/*--------------------大棚信息区表格编辑按钮行为Start---------------*/

	//弹窗关闭
	$(".dapeng-info-close").click(function () {
		$("#dapeng-info-table-edit").hide();
	})
	/*--------------------大棚信息区表格编辑按钮行为End---------------*/

	/*大棚信息区注册新大棚按钮点击事件*/
	$("#btn-log-farm").click(function () {
		$("#reg-new-farm").show();
	})


	//注册新大棚弹窗关闭
	$("#reg-new-farm .dapeng-info-close").click(function () {
		$("#reg-new-farm").hide();
	})

	/*-------------大棚信息区删除按钮弹窗关闭功能-----------*/
	// 当点击关闭和取消按钮时，关闭窗口
	$("#closeIcon-deleteFarm,#deleteFarmCancle").click(function () {
		$("#dapengInfo-deleteFarm").hide();
	})
}


