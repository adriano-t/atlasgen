var editor = null; 
  
function StartEditor(){ 
	editor = new Editor();
	   
}

function Editor(){  
	//working area 
	 
	 
	this.textures = [];
	this.sprites = [];
	this.spr_name_index = 0;
	this.textureSize= 512;
	this.spacing = 1;
	
	this.SetSize = function(){
		
		this.areaW = ((window.innerWidth-5)/4*3 - 5);
		this.areaH = (window.innerHeight-5);
		
		this.centerX = this.areaW / 2;
		this.centerY = this.areaH / 2;
		
		this.div = $("EditorDiv");
		this.div.padding = "0px";
		this.div.style.width = this.areaW + "px";
		this.div.style.height = this.areaH + "px";
		 
		
		optWidth = Math.max(330, (window.innerWidth-5)/4) ;
		this.divOpt = $("Options");
		this.divOpt.style.padding = "5px";
		this.divOpt.style.width = optWidth -10 + "px";
		this.divOpt.style.height = (window.innerHeight-5 - 8) + "px"; 
		this.divOpt.style.left = window.innerWidth - optWidth - 6 +"px" 
		
		//$("output").style.width = (optWidth -25)  + "px";
		
		var helpW = window.innerWidth*3/4;
		var helpH = window.innerHeight*4/5;
		
		SetDivSize($("help"), (window.innerWidth - helpW)/2, (window.innerHeight - helpH)/2, helpW, helpH);
		
		SetDivSize($("spriteOptions"), (window.innerWidth - helpW)/2, (window.innerHeight - helpH)/2, helpW, helpH);
		 
	}
	this.SetSize();
	
	  
	var finput=document.createElement('input');
	finput.type="file";
	finput.multiple = true;
	finput.style.display = "none";  
	finput.onchange = function(){
		editor.LoadMultipleSprites(this);
	}
	
	$("addSpriteMultiple").onclick = function(){
		finput.click();
	}
		 
	$("textureSize").onchange = function(){ 
		editor.textureSize = parseInt(this.options[this.selectedIndex].innerText);
		console.log(editor.textureSize);
	}; 
		
	$("export").onclick = function(){
		editor.Export();
	};
	  
	$("saveFiles").onclick = function(){
	
		var zip = new JSZip();
		
		var currentdate = new Date(); 
		var fid = currentdate.getDate() + "_"
                + (currentdate.getMonth()+1)  + "_" 
                + currentdate.getFullYear() + "_"  
                + currentdate.getHours() + "_"  
                + currentdate.getMinutes() + "_" 
                + currentdate.getSeconds();
				
		
		for(var i=0; i<editor.textures.length; i++){
			var canvas = editor.textures[i];
			var savable = new Image();
			savable.src = canvas.toDataURL();
			zip.file("AtlasTexture"+fid + "/textures/AtlasTexture"+fid+".png", savable.src.substr(savable.src.indexOf(',')+1), {base64: true});
				
		}
		
		for(var i=0; i<editor.sprites.length; i++){
			var sprite = editor.sprites[i];
			zip.file("AtlasTexture"+fid + "/sprites/" + sprite.name+".spr", "#texture AtlasTexture"+fid+".png\n" +sprite.text ); 
		}
		var blob = zip.generate({type:"blob"}); 
		saveAs(blob, "AtlasTexture"+fid+".zip");
		
	}
	 
	$("showHelp").onclick = function(){
		$("help").style.display="block";
	}
	
	$("addSprite").onclick = function(){
		editor.AddSprite(); 
	}
	
	this.NameExists = function(name){
		for(var i = 0; i < editor.sprites.length; i++){
			if(editor.sprites[i].name == name)
				return true;
		}
		return false;
	}
	
	this.AddSprite = function(){
		var spr = {
			name: "sprite" + this.spr_name_index++,
			width: 0,
			height: 0,
			text: "",
			rects: []
		};  
		editor.sprites.push(spr);
		
		var p = document.createElement('p');
		p.style.margin.top = "10px";
		 
		var name = document.createElement('input');
		name.type = "text";
		name.value = spr.name; 
		name.style.width = "100px";
		name.sprite = spr;
		name.onkeyup = function(e){
			console.log(e.keyCode );
			if(!e.ctrlKey && e.keyCode != 17){
				start = this.selectionStart;
				var str = this.value.replace(/[^a-zA-Z0-9_]/g, '');
				if(!editor.NameExists(str)){
					this.sprite.name = str;
				}
				this.value = str;
				this.selectionStart = start;
				this.selectionEnd = start;
			}
		} 
		
		
		name.onchange = function(e){
			if(!editor.NameExists(this.sprite.name)){
				this.sprite.name = this.value;
			}else{
				this.value = this.sprite.name;
				
			}
		}
		
		var container = document.createElement('p'); 
		container.sprite = spr;
		spr.container = container;
		var finput=document.createElement('input');
		finput.type="file";
		finput.multiple = true;
		finput.style.display = "none";
		finput.sprite = spr;
		finput.container = container;
		finput.onchange = function(){
			editor.OnChangeFile(this);
		}
		
		
		var input=document.createElement('input'); 
		input.type="button";
		input.value = "+ Frame"; 
		input.finput = finput;
		input.onclick = function(){
			finput.click();
		}
		
		var del=document.createElement('input'); 
		del.type="button";
		del.value = "x"; 
		del.sprite = spr;
		del.finput = finput;
		
		del.addEventListener("click",function(e){
			if(e.shiftKey || e.ctrlKey)
				this.parentNode.parentNode.removeChild(this.parentNode);
			else if(confirm("Delete "+this.sprite.name+" ?")){
				this.parentNode.parentNode.removeChild(this.parentNode);
			}
			editor.sprites.splice(editor.sprites.indexOf(this.sprite), 1);
		}, false);
		
		
		$("imagesContainer").appendChild(p);
		p.appendChild(name);
		p.appendChild(finput);
		p.appendChild(input);
		p.appendChild(del);
		p.appendChild(container);
		
		
		var div = document.createElement('div');
		div.style.clear="both";
		div.style.border = "0";
		container.appendChild(div);
		
		return spr;
	}
	
	//Load Multiple Sprites
	this.LoadMultipleSprites = function(element){ 
		for(var i=0; i<element.files.length; i++){
			var file = element.files[i]; 
			
			var fr = new FileReader();
			fr.name = file.name;
			 
			fr.onload = function(){
			
				var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
 
				if(extension == "png" || extension  == "jpg"  || extension  == "jpeg"  || extension  == "bmp" ){
				
					var sprite = editor.AddSprite();
					
					//image and rect for the atlas
					var img = new Image();
					img.name = this.name;
					img.src = this.result;
					
					sprite.width = img.width;
					sprite.height = img.height;
					var rect = new Rect(img);
					rect.sprite = sprite; 
					sprite.rects.push(rect); 
					
					sprite.container.appendChild(PreviewImage(sprite, this)); 
					 
				}
				
			};
			fr.readAsDataURL(file);
		}
	}   
	
	var PreviewImage = function(sprite, data){
		//preview image
		var img = new Image();
		img.src = data.result; 
		img.title ="("+img.width+", "+img.height+") "+data.name;
		img.width = Math.min(48, img.width);
		img.height = Math.min(48, img.height);
		img.style.border = "1px dotted black";
		img.style.margin = "2px"; 
		img.sprite = sprite;
		img.name = data.name;
		img.onclick = function(e){
			if(e.shiftKey || e.ctrlKey)
				editor.RemoveImage(this);
			else{
				if (confirm("Delete sprite "+this.name+" ?\n\n (Keep CTRL pressed to avoid this dialog on delete)")) {
					editor.RemoveImage(this);
				}
			}
		}
		return img;
	}
	//Load image file
	this.OnChangeFile = function(element){ 
	 
		for(var i=0; i<element.files.length; i++){
			var file = element.files[i]; 
			
			var fr = new FileReader();
			fr.name = file.name;
			 
			fr.onload = function(){
			
				var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
 
				if(extension == "png" || extension  == "jpg"  || extension  == "jpeg"  || extension  == "bmp" ){
				
					//image and rect for the atlas
					var img = new Image();
					img.src = this.result;
					
					if(element.sprite.width == 0 || element.sprite.height == 0){
						element.sprite.width = img.width;
						element.sprite.height = img.height;
					}
					if( element.sprite.width == img.width && element.sprite.height == img.height){
						img.name = this.name;
						var rect = new Rect(img);
						rect.sprite = element.sprite;
						element.sprite.rects.push(rect); 
						 
						element.container.appendChild(PreviewImage(element.sprite, this));
					}else{
						alert(this.name + " has wrong sizes\n you need: "+element.sprite.width+"x"+element.sprite.height);
					}
				}
				
			};
			fr.readAsDataURL(file);
		}
	}  
	   
	this.RemoveImage = function(elem){
		elem.sprite.rects.splice(elem.sprite.rects.indexOf(elem), 1);
		elem.parentNode.removeChild(elem);
		if(elem.sprite.rects.length == 0){
			elem.sprite.width = 0;
			elem.sprite.height = 0;
		}
	}
	
	this.Export = function(){
		//destroy old textures
		while (this.div.firstChild) {
			this.div.removeChild(this.div.firstChild);
		}
		
		
		var imagesRects = [];
		//add images
		for(var i = 0; i < editor.sprites.length; i++){
			Array.prototype.push.apply(imagesRects, editor.sprites[i].rects); 
		}
		
		if(imagesRects.length == 0) return;
		//atlas textures to export
		this.textures = []; 
		
		//setup rects
		for(var i = 0; i< imagesRects.length; i++){
			var rect = imagesRects[i];
			rect.fit = undefined;
			//get rect index, for the sorting
			rect.index = rect.sprite.rects.indexOf(this);
			//check rect size
			if(rect.w > this.textureSize || rect.h > this.textureSize){
				alert("image '"+rect.image.name+"' is too big for the choosen texture size ("+this.textureSize+"px)");
				return 0;
			} 
		}
		//sort and pack
		imagesRects.sort(function(a, b) {return a.area - b.area});
		var packer = new Packer(this.textureSize, this.textureSize);
    
		packer.init(this.textureSize, this.textureSize);
		packer.fit(imagesRects);
		
		var error = false;
		for(var i = 0; i< imagesRects.length; i++){
			var rect = imagesRects[i];
			if(!rect.fit)
			{
				error = true;
				break;
			}
		}
		
		if(!error)
		{
			//render   
			var canvas = document.createElement('canvas'); 
			canvas.width = this.textureSize;
			canvas.height = this.textureSize;
			canvas.ctx = canvas.getContext("2d");
			canvas.style.margin = "5px";
			canvas.style.border = "1px dotted black"; 
			this.textures.push(canvas);
			this.div.appendChild(canvas);
			  
			var offset = Math.floor(this.spacing/2);
			
			canvas.ctx.clearRect(0, 0, canvas.width, canvas.height); 
			
			 
			while(imagesRects.length > 0){
				var rect = imagesRects.pop();
				canvas.ctx.drawImage(rect.image, offset+rect.fit.x, offset+rect.fit.y);  
			}
			
			
			for(var i = 0; i < editor.sprites.length; i++){
				
				var spr = editor.sprites[i];
				spr.text = "";
				spr.text += "s "+spr.name+" "+spr.rects.length +" "+spr.width +" "+spr.height +" 0 0\n";
				
				for(var j = 0; j < spr.rects.length; j++){
					var rect = spr.rects[j];
					spr.text +=  (offset+rect.fit.x)+" "+(offset+rect.fit.y)+"\n";
				}
			}
			
			//$("output").value = str; "exported the void!";//JSON.stringify(this.verts);
			$("saveFiles").style.display = "inline";
		
		}
		else
		{
			alert("Can't complete. select a bigger texture \n There are too many sprites for this texture");
		}
	}
	  
	function Rect(img){
		this.image = img;
		this.x = 0;
		this.y = 0;
		this.w = img.width+editor.spacing*2;
		this.h = img.height+editor.spacing*2;
		this.area = this.w*this.h; 
	}
	 
	    
}
  
  

 


