const processor = (event) => {
  console.log(event);
  xhttp.open("POST", "127.0.0.1:5900/api/jobs", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(event));
}

export default processor;
