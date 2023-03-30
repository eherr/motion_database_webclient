function UnityProgress(gameInstance, progress) {
  if (!gameInstance.Module)
    return;

    var length = 200 * Math.min(progress, 1);
    bar = document.getElementById("progress-bar")
    bar.style.width = length + "px";
    document.getElementById("loading-info").innerHTML = "Loading... " + (length/2) + "%";

  if (progress == 1){
    document.getElementById("loading-box").style.display = "none";
    document.getElementById("loading-overlay").style.display = "none";
    InitPlayer(gameInstance);
  }
}

function InitPlayer(gameInstance){
  // Set the server url to be used by the unity client
  var port = $('meta[name=port]').attr("content");
  port = parseInt(port);
  let activatePortForwardingStr = $('meta[name=activatePortForwarding]').attr("content");
  let activatePortForwarding = (activatePortForwardingStr== "True");
  gameInstance.SendMessage("AnimationGUI", "SetPort", port); //port=-1 disables the port
  if(activatePortForwarding){
    gameInstance.SendMessage("AnimationGUI", "TogglePortWorkaround"); //changes the url to use a "/" instead of ":" when using the port
  }
  gameInstance.SendMessage("AnimationGUI", "SetProtocol", window.location.protocol.substring(0,  window.location.protocol.length - 1));
  gameInstance.SendMessage("AnimationGUI", "SetURL", window.location.hostname);
  gameInstance.SendMessage("AnimationGUI", "SetSourceSkeleton", "custom");//performs setup of skeleton
  //gameInstance.SendMessage("AnimationGUI", "GetSkeleton"); 
}
