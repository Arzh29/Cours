window.onload = function() {
	//récupération du canvas
	//le canvas c'est votre tableau sur lequel vous allez pouvoir dessiner
	canvas = document.getElementById("canvas");
	if(!canvas)
	{
		alert("Impossible de récupérer le canvas Img");
		return;
	}
	//récupération du contexte
	//le contexte permet de dessiner dans le canvas c'est un outil qui vous donne un pinceau pour dessiner sur le tableau
	ctx = canvas.getContext("2d");
	if(!ctx)
	{
		alert("Impossible de récupérer le context Img");
		return;
	}
	//définition de la taille du canvas width:largeur  height:hauteur
	canvas.width = 500;
	canvas.height = 500;
	var TCarre = [{
		positionX:200,
		positionY:10,
		vitesseX:Math.floor(Math.random()*10)+5,
		vitesseY:Math.floor(Math.random()*10)+5,
		couleur:'blue'
	},{
		positionX:0,
		positionY:100,
		vitesseX:Math.floor(Math.random()*10)+5,
		vitesseY:Math.floor(Math.random()*10)+5,
		couleur:'green'
	},{
		positionX:300,
		positionY:200,
		vitesseX:Math.floor(Math.random()*10)+5,
		vitesseY:Math.floor(Math.random()*10)+5,
		couleur:'red'
	},{
		positionX:100,
		positionY:200,
		vitesseX:Math.floor(Math.random()*10)+5,
		vitesseY:Math.floor(Math.random()*10)+5,
		couleur:'black'
	},{
		positionX:400,
		positionY:0,
		vitesseX:Math.floor(Math.random()*10)+5,
		vitesseY:Math.floor(Math.random()*10)+5,
		couleur:'yellow'
	}];
	
	//boucle de dessin elle permet de lancer les commandes toutes les 40 millisecondes dans notre cas selon le chiffre indiqué à la fin
	setInterval(function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		
		for (var i=0,j=TCarre.length;i<j;i++)
		{
			carre = TCarre[i];
			carre.positionX += carre.vitesseX;
			carre.positionY += carre.vitesseY;
			if (carre.positionX>canvas.width-100||carre.positionX<0) {
				carre.vitesseX = -1*carre.vitesseX;
			}
			if (carre.positionY>canvas.height-100||carre.positionY<0) {
				carre.vitesseY = -1*carre.vitesseY;
			}
			ctx.fillStyle = carre.couleur;		
			ctx.beginPath();
			ctx.arc(carre.positionX+50, carre.positionY+50, 50, 0, 2 * Math.PI, false);
			ctx.fill();
		}
		
	//définition du temps entre chaque exécution
	},40);
}