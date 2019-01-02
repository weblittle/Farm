window.onload = function () {

    if (localStorage.Name != undefined) {
        $("input").eq(0).val(localStorage.Name);
    }
}
function confirm() {
    var account = $("input").eq(0).val();//获取界面的用户名和密码
    var pwd = $("input").eq(1).val();
    var data = {
        Name: account,
        Password: pwd
    };
    if ($("#remember-me").is(":checked")) {
        window.localStorage.Name = $("input").eq(0).val();
    }
    var msg = JSON.stringify(data);//JSON.stringify(data)用于从一个对象解析出字符串
    if (account == "" || pwd == "") {
        alert("用户名和密码均不能为空");
        return false;//若满足if条件，程序不再继续执行
    } else {  //以上均符合要求，则调用登录esb接口
        $.ajax({
            url: "http://211.149.245.105:8866/MonitorService.svc/webHttp/GetOwnInfo", //相对应的esb接口地址
            type: 'post',
            data: msg,//向服务器（接口）传递的参数
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (data) {//服务器（接口）返回来的数据
                var otg = data.GetOwnInfoResult;
                console.log(otg);
                if (otg.length != 0) {
                    var Name = otg[0].Name;
                    sessionStorage.setItem("Name",Name);
                    sessionStorage.setItem("Password",otg[0].Password);
                    sessionStorage.setItem("UserID",otg[0].UserID);
                    sessionStorage.setItem("UserType",otg[0].UserType);
                    //要跳转的地址
                    var address = window.location.search.split("%27")[1];
                    if (address != undefined) {
                        window.location.href = address;//正确登录后页面跳转至目标页
                    }
                    else {
                        window.location.href = "index.html";
                    }
                }
                else {
                    alert("用户名或者密码错误，请重新输入！");
                    $("input").eq(0).val("");
                    $("input").eq(1).val("");
                }
            },
            error: function () {
                alert("用户名或者密码错误，请重新输入！");
                $("input").eq(0).val("");
                $("input").eq(1).val("");
            }
        });
    }
}
//判断是否点击了enter键
$(document).keyup(function (event) {
    if (event.keyCode == 13) {
        $("#login").trigger("click");//trigger触发一个事件
    }
});
