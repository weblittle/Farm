//全局变量
//接口基地址
var baseUrl="http://211.149.245.105:8866/MonitorService.svc/webHttp/";
//登陆的用户名和密码
var data={
	Name: sessionStorage.Name,
	Password: sessionStorage.Password
};
var msg=JSON.stringify(data);
window.onload=function(){

	/*-----------------------账户功能---------------------*/
	
	//获取用户个人信息
	$.ajax({
		url:baseUrl+"GetOwnInfo",
		type:"post",
		data:msg,
		dataType:"json",
		contentType:"application/json;charset=utf-8",
		success:function(result)
		{
			var obj=result.GetOwnInfoResult;
			// 游客禁用某些功能
			if (obj[0].UserType == "游客") {
                $("#nav4,#nav6").removeAttr("onclick");
				$("#nav4 img,#nav6 img").removeAttr("onmouseover");
            }
			//根据性别
			if(obj[0].Gender=="女")
			{
				$(".headImage img").attr("src","imges/female.png");
			}
			else
			{
				$(".headImage img").attr("src","imges/manImage.png");
			}
			//把用户信息显示到页面
			$("#userID").text(obj[0].UserID);
			$("#userName").text(obj[0].Name);
			$("#name").text(obj[0].RealName);
			$("#phoneNum").text(obj[0].Phone);
			$("#idCard").text(obj[0].IDNum);
			$("#userType").text(obj[0].UserType);

		}
	})

}
	