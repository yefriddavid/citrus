<?php

$type = isset($_GET["type"]) ? $_GET["type"] : "files";
include("class.phpmailer.php");
include("class.smtp.php");

require '../Slim/Slim.php';

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();
$app->contentType('application/json');
$app->expires('-1000000');
$db = new PDO('sqlite:db.sqlite3');
$sth = $db->query('SELECT * FROM parameters;');
$sth->execute();
$data = $sth->fetchAll();
//print_r($data);exit;

$Username = $data[1]["value"];
$Host = $data[2]["value"];
$Port = $data[3]["value"];
$Password = $data[4]["value"];
$SMTPSecure = $data[5]["value"];
$FromName = $data[6]["value"];
$SMTPAuth = $data[7]["value"]==1?true:false;
$MailNofificaciones = $data[8]["value"];

$mail = new PHPMailer();
$mail->IsSMTP();
$mail->SMTPAuth = $SMTPAuth;
$mail->SMTPSecure = $SMTPSecure;//"ssl";
$mail->Host = $Host;//"smtp.gmail.com";
$mail->Port = $Port;//465;
$mail->Username = $Username;//"faconsultoria@integraconsultores.co";
$mail->Password = $Password;

$mail->From = $mail->Username;
$mail->FromName = $FromName;//"faconsultoria";


if ($type == "files") {
    $to = $_POST["to"];
    $subject = $_POST["subject"];

    
    $questionId = $_GET["questionId"];
    $question = $_POST["question"];
    $response = $_POST["response"];
    
    $mail->Subject = $subject;
    $mail->AltBody = $question;
    $mail->MsgHTML("<h2>".$question."</h2><br />".$response);
    $path = dirname(__FILE__) . "/files/" . $questionId;
    if (is_dir($path)) {
        $files = scandir($path);
        unset($files[0]);
        unset($files[1]);
        foreach ($files as $key => $value) {
            $mail->AddAttachment(dirname(__FILE__) . "/files/$questionId/" . $value);
        }
    }
    $mail->AddAddress($to, "");
    $mail->IsHTML(true);

    if (!$mail->Send()) {
        echo "Error: " . $mail->ErrorInfo;
    } else {
        /* Enviar un log al correo de logs */
        $userCode = $_POST["userCode"];
        $mail->ClearAddresses();
        $mail->ClearAttachments();
        $mail->Subject = "Plataforma Peritaje, Mail Saliente";
        $mail->AltBody = "";
        $mail->MsgHTML("Se ha enviado un correo a: $to de la pregunta:$question, Consecutivo: $userCode");
        $mail->AddAddress($MailNofificaciones, "");
        $mail->Send();
        echo "Mensaje enviado correctamente";
    }
} elseif ($type == "rememberme") {

    
    $to = $app->request()->post('mail');
    $sth = $db->query('SELECT * FROM users WHERE mail = ? LIMIT 1;');
    $sth->execute(array($to));
    $data = $sth->fetchAll();
    if ($data) {
        $mail->Subject = "Recordar Password";
        $mail->AddAddress($to, "");
        $data = $data[0];
        $mail->MsgHTML("El password y el login son, <br /><b>Pass:</b>" . $data["password"] . " <b>User:</b>" . $data["login"]);
        $mail->Send();
    } else {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-type: text/plain');
        exit("Aun no ha creado la pregunta");
    }
}
?>
