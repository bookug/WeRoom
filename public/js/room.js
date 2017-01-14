/**
 * Created by an.han on 14-2-20.
 * Modified by xiaode on 2017.1.12.
 */
var list ;
var boxs ;
var timer;
var image = '../images/32f1bbd052aa269094cfc443e51b7b91.jpg';
var statetextsend="写写你的心情吧...";
var username="bookug";

var httpRequest;
function handleResponse()
{
	if(httpRequest.readyState == 4 && httpRequest.status == 200){
		//if(httpRequest.responseText=="OK")
		//	console.log("OK");
		console.log(httpRequest.responseText);
		str = JSON.parse(httpRequest.responseText);
		console.log(str.success);
	}
}
function RequestToServer(formData,type)
{

	httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open("POST",type,true);

	httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	//httpRequest.setRequestHeader('Content-Type','application/json;charset=utf-8');
	
	httpRequest.send(formData);
}
function Loadpic(file)
{
    if (!file.files || !file.files[0]) {
            return;
    }
    var reader = new FileReader();
    reader.onload = function (evt) {
		document.getElementById('image').src = evt.target.result;
        image = evt.target.result;
    }
        reader.readAsDataURL(file.files[0]);
}

function SendState()
{
	statetextsend=document.getElementsByClassName('stateText')[0].value;
	//这里的t就是用户输入的内容
	img=image;
	timestamp=formateDate(new Date());
	addNode(username,statetextsend,img,timestamp);
	//用户上传的图片在image中
	
	//var formData="image="+image+"&name="+username+"&text="+statetextsend+"&time="+timestamp;
	var formData="name="+username+"&text="+statetextsend+"&time="+timestamp;
	type="http://127.0.0.1:8888/addMessage";
	RequestToServer(formData,type);
}
function addNode(user,statetext,imgURL,timestamp)
	{	
		var stateList = document.getElementsByClassName('stateList')[0];
		var stateBox = document.createElement('div');
		stateBox.className="box clearfix";
		stateBox.innerHTML=
		'<a class="close" href="javascript:;">×</a>'+
            '<img class="head" src="../images/8.jpg" alt=""/>'+
            '<div class="content">'+
                '<div class="main">'+
                    '<p class="txt">'+
                        '<span class="user">'+user+'：</span>'+statetext+'</p>'+
                '</div>'+
				'<img class="pic" src='+imgURL+' alt=""/>'+
                '<div class="info clearfix">'+
                    '<span class="time">'+timestamp+'</span>'+
                '</div>'+
                '<div class="praises-total" total="0" style="display: none;"></div>'+
                '<div class="comment-list">'+
                '</div>'+
                '<div class="text-box">'+
                    '<textarea class="comment" autocomplete="off">评论…</textarea>'+
                    '<button class="btn ">回 复</button>'+
                    '<span class="word"><span class="length">0</span>/140</span>'+
                '</div>'
			stateList.appendChild(stateBox);
			listenToEnvent();
			//console.log(boxs.length);
	}
	
	
function listenToEnvent()
{
	 //把事件代理到每条分享div容器
    for (var i = 0; i < boxs.length; i++) {//
		console.log("循环执行了吗");
        //点击
        boxs[i].onclick = function (e) {
			
            e = e || window.event;
            var el = e.srcElement;
            switch (el.className) {

                //关闭分享
                case 'close':
                    removeNode(el.parentNode);
                    break;

                //赞分享
                case 'praise':
                    praiseBox(el.parentNode.parentNode.parentNode, el);
					//addNode(el.parentNode.parentNode.parentNode, el);
                    break;

                //回复按钮蓝
                case 'btn':
                    reply(el.parentNode.parentNode.parentNode, el);
                    break

                //回复按钮灰
                case 'btn btn-off':
                    clearTimeout(timer);
                    break;

                //操作留言
                case 'comment-operate':
                    operate(el);
                    break;
            }
        }
		
		
        //评论
        var textArea = boxs[i].getElementsByClassName('comment')[0];

        //评论获取焦点
        textArea.onfocus = function () {
            this.parentNode.className = 'text-box text-box-on';
            this.value = this.value == '评论…' ? '' : this.value;
            this.onkeyup();
        }

        //评论失去焦点
        textArea.onblur = function () {
            var me = this;
            var val = me.value;
            if (val == '') {
                timer = setTimeout(function () {
                    me.value = '评论…';
                    me.parentNode.className = 'text-box';
                }, 200);
            }
        }

        //评论按键事件
        textArea.onkeyup = function () {
            var val = this.value;
            var len = val.length;
            var els = this.parentNode.children;
            var btn = els[1];
            var word = els[2];
            if (len <=0 || len > 140) {
                btn.className = 'btn btn-off';
            }
            else {
                btn.className = 'btn';
            }
            word.innerHTML = len + '/140';
        }

    }
}
//格式化日期
function formateDate(date) {
    var y = date.getFullYear();
	var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var mi = date.getMinutes();
    m = m > 9 ? m : '0' + m;
    return y + '-' + m + '-' + d + ' ' + h + ':' + mi;
}

//删除节点
    function removeNode(node) {
        node.parentNode.removeChild(node);
		console.log(boxs.length);
    }

/**
     * 赞分享
     * @param box 每个分享的div容器
     * @param el 点击的元素
     */
    function praiseBox(box, el) {
        var txt = el.innerHTML;
        var praisesTotal = box.getElementsByClassName('praises-total')[0];
        var oldTotal = parseInt(praisesTotal.getAttribute('total'));
        var newTotal;
        if (txt == '赞') {
            newTotal = oldTotal + 1;
            praisesTotal.setAttribute('total', newTotal);
            praisesTotal.innerHTML = (newTotal == 1) ? '我觉得很赞' : '我和' + oldTotal + '个人觉得很赞';
            el.innerHTML = '取消赞';
        }
        else {
            newTotal = oldTotal - 1;
            praisesTotal.setAttribute('total', newTotal);
            praisesTotal.innerHTML = (newTotal == 0) ? '' : newTotal + '个人觉得很赞';
            el.innerHTML = '赞';
        }
        praisesTotal.style.display = (newTotal == 0) ? 'none' : 'block';
    }

/**
     * 发评论
     * @param box 每个分享的div容器
     * @param el 点击的元素
     */
    function reply(box, el) {
        var commentList = box.getElementsByClassName('comment-list')[0];
        var textarea = box.getElementsByClassName('comment')[0];
        var commentBox = document.createElement('div');
        commentBox.className = 'comment-box clearfix';
        commentBox.setAttribute('user', 'self');
        commentBox.innerHTML =
            '<img class="myhead" src="../images/my.jpg" alt=""/>' +
                '<div class="comment-content">' +
                '<p class="comment-text"><span class="user">我：</span>' + textarea.value + '</p>' +
                '<p class="comment-time">' +
                formateDate(new Date()) +
                '<a href="javascript:;" class="comment-operate">删除</a>' +
                '</p>' +
                '</div>'
        commentList.appendChild(commentBox);
        textarea.value = '';
        textarea.onblur();
    }
	
/**
     * 操作留言
     * @param el 点击的元素
     */
    function operate(el) {
        var commentBox = el.parentNode.parentNode.parentNode;
        var box = commentBox.parentNode.parentNode.parentNode;
        var txt = el.innerHTML;
        var user = commentBox.getElementsByClassName('user')[0].innerHTML;
        var textarea = box.getElementsByClassName('comment')[0];
        if (txt == '回复') {
            textarea.focus();
            textarea.value = '回复' + user;
            textarea.onkeyup();
        }
        else {
            removeNode(commentBox);
        }
    }
	
window.onload = function () {
	console.log("befor eonload");
	//console.log("cookie: "+document.cookie.split("=")[1]);
	username = document.cookie.split("=")[1];
	list = document.getElementById('list');
	//TODO:set username according to cookies
    boxs = list.children;
	console.log("before listen");
	listenToEnvent();
}

