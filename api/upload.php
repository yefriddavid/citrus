<?php
/*
 * jQuery File Upload Plugin PHP Example 5.2.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */
$type = isset($_GET["type"]) ? $_GET["type"] : "files";
include("class.phpmailer.php");
include("class.smtp.php");

require '../Slim/Slim.php';


error_reporting(E_ALL | E_STRICT);

class UploadHandler
{
    private $options;
    
    function __construct($options=null) {
        $this->options = array(
            'script_url' => $_SERVER['PHP_SELF'],
            'upload_dir' => dirname(__FILE__).'/files/',
            'upload_url' => dirname($_SERVER['PHP_SELF']).'/files/',
//            'upload_dir' => dirname(__FILE__).'/files/'.$_POST['questionId']."/",
//            'upload_url' => dirname($_SERVER['PHP_SELF']).'/files/'.$_POST['questionId']."/",
            'param_name' => 'files',
            // The php.ini settings upload_max_filesize and post_max_size
            // take precedence over the following max_file_size setting:
            'max_file_size' => null,
            'min_file_size' => 1,
            'accept_file_types' => '/.+$/i',
            'max_number_of_files' => null,
            'discard_aborted_uploads' => true,
            'image_versions' => array(
                // Uncomment the following version to restrict the size of
                // uploaded images. You can also add additional versions with
                // their own upload directories:
                /*
                'large' => array(
                    'upload_dir' => dirname(__FILE__).'/files/',
                    'upload_url' => dirname($_SERVER['PHP_SELF']).'/files/',
                    'max_width' => 1920,
                    'max_height' => 1200
                ),
                */
                'thumbnail' => array(
                    'upload_dir' => dirname(__FILE__).'/thumbnails/',
                    'upload_url' => dirname($_SERVER['PHP_SELF']).'/thumbnails/',
                    'max_width' => 80,
                    'max_height' => 80
                )
            )
        );
        if ($options) {
            
            foreach ($options as $key => $value) {
                $this->options[$key] = $value;
            }
            
            //$this->options = array_merge_recursive($this->options, $options);
            //var_dump($this->options);exit;
        }
    }
    
    private function get_file_object($file_name) {
        $file_path = $this->options['upload_dir'].$file_name;
        if (is_file($file_path) && $file_name[0] !== '.') {
            $file = new stdClass();
            $file->name = $file_name;
            $file->size = filesize($file_path);
            $file->url = $this->options['upload_url'].rawurlencode($file->name);
            foreach($this->options['image_versions'] as $version => $options) {
                if (is_file($options['upload_dir'].$file_name)) {
                    $file->{$version.'_url'} = $options['upload_url']
                        .rawurlencode($file->name);
                }
            }
            $file->delete_url = $this->options['script_url']
                .'?file='.rawurlencode($file->name);
            $file->delete_type = 'DELETE';
            return $file;
        }
        return null;
    }
    
    private function get_file_objects() {
        return array_values(array_filter(array_map(
            array($this, 'get_file_object'),
            scandir($this->options['upload_dir'])
        )));
    }

    private function create_scaled_image($file_name, $options) {
        $file_path = $this->options['upload_dir'].$file_name;
        $new_file_path = $options['upload_dir'].$file_name;
        list($img_width, $img_height) = @getimagesize($file_path);
        if (!$img_width || !$img_height) {
            return false;
        }
        $scale = min(
            $options['max_width'] / $img_width,
            $options['max_height'] / $img_height
        );
        if ($scale > 1) {
            $scale = 1;
        }
        $new_width = $img_width * $scale;
        $new_height = $img_height * $scale;
        $new_img = @imagecreatetruecolor($new_width, $new_height);
        switch (strtolower(substr(strrchr($file_name, '.'), 1))) {
            case 'jpg':
            case 'jpeg':
                $src_img = @imagecreatefromjpeg($file_path);
                $write_image = 'imagejpeg';
                break;
            case 'gif':
                $src_img = @imagecreatefromgif($file_path);
                $write_image = 'imagegif';
                break;
            case 'png':
                $src_img = @imagecreatefrompng($file_path);
                $write_image = 'imagepng';
                break;
            default:
                $src_img = $image_method = null;
        }
        $success = $src_img && @imagecopyresampled(
            $new_img,
            $src_img,
            0, 0, 0, 0,
            $new_width,
            $new_height,
            $img_width,
            $img_height
        ) && $write_image($new_img, $new_file_path);
        // Free up memory (imagedestroy does not delete files):
        @imagedestroy($src_img);
        @imagedestroy($new_img);
        return $success;
    }
    
    private function has_error($uploaded_file, $file, $error) {
        if ($error) {
            return $error;
        }
        //print $file->name;exit;
        if (!preg_match($this->options['accept_file_types'], $file->name)) {
            return 'acceptFileTypes';
        }
        if ($uploaded_file && is_uploaded_file($uploaded_file)) {
            $file_size = filesize($uploaded_file);
        } else {
            $file_size = $_SERVER['CONTENT_LENGTH'];
        }
        if ($this->options['max_file_size'] && (
                $file_size > $this->options['max_file_size'] ||
                $file->size > $this->options['max_file_size'])
            ) {
            return 'maxFileSize';
        }
        if ($this->options['min_file_size'] &&
            $file_size < $this->options['min_file_size']) {
            return 'minFileSize';
        }
        if (is_int($this->options['max_number_of_files']) && (
                count($this->get_file_objects()) >= $this->options['max_number_of_files'])
            ) {
            return 'maxNumberOfFiles';
        }
        return $error;
    }
    
    private function handle_file_upload($uploaded_file, $name, $size, $type, $error) {
        $file = new stdClass();
        $file->name = basename(stripslashes($name));
        $file->size = intval($size);
        $file->type = $type;
        $error = $this->has_error($uploaded_file, $file, $error);
        if (!$error && $file->name) {
            if ($file->name[0] === '.') {
                $file->name = substr($file->name, 1);
            }
            $file_path = $this->options['upload_dir'].$file->name;
            $append_file = is_file($file_path) && $file->size > filesize($file_path);
            clearstatcache();
            if ($uploaded_file && is_uploaded_file($uploaded_file)) {
                // multipart/formdata uploads (POST method uploads)
                if ($append_file) {
                    file_put_contents(
                        $file_path,
                        fopen($uploaded_file, 'r'),
                        FILE_APPEND
                    );
                } else {
                    move_uploaded_file($uploaded_file, $file_path);
                }
            } else {
                // Non-multipart uploads (PUT method support)
                file_put_contents(
                    $file_path,
                    fopen('php://input', 'r'),
                    $append_file ? FILE_APPEND : 0
                );
            }
            $file_size = filesize($file_path);
            if ($file_size === $file->size) {
                $file->url = $this->options['upload_url'].rawurlencode($file->name);
                foreach($this->options['image_versions'] as $version => $options) {
                    if ($this->create_scaled_image($file->name, $options)) {
                        $file->{$version.'_url'} = $options['upload_url']
                            .rawurlencode($file->name);
                    }
                }
            } else if ($this->options['discard_aborted_uploads']) {
                unlink($file_path);
                $file->error = 'abort';
            }
            $file->size = $file_size;
            $file->delete_url = $this->options['script_url']
                .'?file='.rawurlencode($file->name);
            $file->delete_type = 'DELETE';
        } else {
            $file->error = $error;
        }
        return $file;
    }
    
    public function get() {
        $file_name = isset($_REQUEST['file']) ?
            basename(stripslashes($_REQUEST['file'])) : null; 
        if ($file_name) {
            $info = $this->get_file_object($file_name);
        } else {
            $info = $this->get_file_objects();
        }
        header('Content-type: application/json');
        echo json_encode($info);
    }
    
    public function post() {
        $upload = isset($_FILES[$this->options['param_name']]) ?
            $_FILES[$this->options['param_name']] : array(
                'tmp_name' => null,
                'name' => null,
                'size' => null,
                'type' => null,
                'error' => null
            );
        
//        print_r($_FILES[$this->options['param_name']]);exit;
        //print_r($_FILES);exit;
        $info = array();
        if (is_array($upload['tmp_name'])) {
            foreach ($upload['tmp_name'] as $index => $value) {
                $info[] = $this->handle_file_upload(
                    $upload['tmp_name'][$index],
                    isset($_SERVER['HTTP_X_FILE_NAME']) ?
                        $_SERVER['HTTP_X_FILE_NAME'] : $upload['name'][$index],
                    isset($_SERVER['HTTP_X_FILE_SIZE']) ?
                        $_SERVER['HTTP_X_FILE_SIZE'] : $upload['size'][$index],
                    isset($_SERVER['HTTP_X_FILE_TYPE']) ?
                        $_SERVER['HTTP_X_FILE_TYPE'] : $upload['type'][$index],
                    $upload['error'][$index]
                );
            }
        } else {
            $info[] = $this->handle_file_upload(
                $upload['tmp_name'],
                isset($_SERVER['HTTP_X_FILE_NAME']) ?
                    $_SERVER['HTTP_X_FILE_NAME'] : $upload['name'],
                isset($_SERVER['HTTP_X_FILE_SIZE']) ?
                    $_SERVER['HTTP_X_FILE_SIZE'] : $upload['size'],
                isset($_SERVER['HTTP_X_FILE_TYPE']) ?
                    $_SERVER['HTTP_X_FILE_TYPE'] : $upload['type'],
                $upload['error']
            );
        }
        header('Vary: Accept');
        if (isset($_SERVER['HTTP_ACCEPT']) &&
            (strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
            header('Content-type: application/json');
        } else {
            header('Content-type: text/plain');
        }
        /*Subir el archivo a google*/        
        /*Si no sube el archivo guardamos la ruta local,para que él usuario visualice el archivo*/
        $ID = "api/files/{$upload['name']}";            

        /*Guardar el archivo en la base de datos*/
        \Slim\Slim::registerAutoloader();
        $app = new \Slim\Slim();
        $app->contentType('application/json');
        $app->expires('-1000000');
        $db = new PDO('sqlite:db.sqlite3');
        $sth = $db->prepare('INSERT INTO files (localFileName,remoteFileName)values(?,?);');
        $sth->execute(array($upload['name'],$ID));               
        $lastInsertId = $db->lastInsertId();
        $ID = subirArchivoGoogle($this->options,$upload);/*Si google no funciona o genera error para todo aca*/                    
        $sth = $db->prepare('UPDATE files SET remoteFileName =? WHERE fileId=?;');
        $sth->execute(array($ID,$lastInsertId));
        //print "yefrid ".$lastInsertId;
        echo json_encode($info);
    }
    
    public function delete($Data) {
        $file_name = isset($Data['file']) ?
            basename(stripslashes($Data['file'])) : null;

        $file_path = $this->options['upload_dir'].$file_name;
        $success = is_file($file_path) && $file_name[0] !== '.' && unlink($file_path);
        if ($success) {
            foreach($this->options['image_versions'] as $version => $options) {
                $file = $options['upload_dir'].$file_name;
                if (is_file($file)) {
                    unlink($file);
                }
                
            }
        }
        header('Content-type: application/json');
        /*Guardar el archivo en la base de datos*/
        \Slim\Slim::registerAutoloader();
        $app = new \Slim\Slim();
        $app->contentType('application/json');
        $app->expires('-1000000');
        $db = new PDO('sqlite:db.sqlite3');
        $sth = $db->prepare('DELETE FROM files WHERE localFileName=?;');
        $sth->execute(array($Data['file']));        
        echo json_encode($success);
    }
}

function subirArchivoGoogle($options,$upload){
    $localFileName = $upload["name"];
    //$questionId = $_POST["questionId"];
    //$localDir = $options["upload_dir"];
    
    set_include_path(dirname(__FILE__));
    include 'Zend/Gdata/Docs.php';
    include 'Zend/Gdata/Docs/Query.php';
    include 'Zend/Gdata/ClientLogin.php';
    include 'Zend/Gdata/Docs/AclEntry.php';
    include 'Zend/Gdata/Acl/Role.php';
    include 'Zend/Gdata/Acl/Scope.php';
    //include 'uploader.php';
    $username = 'ybsoftware.peritaje@gmail.com';
    $password = 'ybsoftware2014*';
    $service = Zend_Gdata_Docs::AUTH_SERVICE_NAME;                 
    
    //return false;
    $httpClient = Zend_Gdata_ClientLogin::getHttpClient($username, $password,$service);
    $docs = new Zend_Gdata_Docs($httpClient);
    
    $newDocumentEntry = $docs->uploadFile($options["upload_dir"]."$localFileName", $localFileName);//,
//    $newDocumentEntry = $docs->uploadFile(dirname(__FILE__)."/files/$localFileName", $localFileName);//,
//        'text/plain', Zend_Gdata_Docs::DOCUMENTS_LIST_FEED_URI);
    //$Arr_Headers = $httpClient->getLastResponse()->getHeaders();


    $query = new Zend_Gdata_Docs_Query();
           $query->setTitle($newDocumentEntry->getTitle())
                 ->setTitleExact('true');

    $feed = $docs->getDocumentListFeed($query);
    $aclEntry = new Zend_Gdata_Docs_AclEntry();
    $aclEntry->setAclScope(new Zend_Gdata_Acl_Scope("","default"));       
    $aclEntry->setAclRole(new Zend_Gdata_Acl_Role("reaader"));
    $aclEntry->category = array(new Zend_Gdata_App_Extension_Category(
        'http://schemas.google.com/acl/2007#accessRule', 'http://schemas.google.com/g/2005#kind'));   
    //print $aclEntry->category;
    $selfLinkHref = $feed->entries[0]->getSelfLink()->href;
    //print_r($feed->entries[0]);
    //$Entry = new Zend_Gdata_Docs_DocumentListEntry();
    $Entry = $feed->entries[0];
    $selfLinkHref = $Entry->getAlternateLink()->getHref();
//    print_r($link);exit;
//    print_r($Entry->getLink());
    //print(get_class($Entry));
    //print_r($Entry->setTitle("yefrid"));
//    $selfLinkHref = explode("%3A", $selfLinkHref);
    return $selfLinkHref;//[1];
}

header('Pragma: no-cache');
header('Cache-Control: private, no-cache');
header('Content-Disposition: inline; filename="files.json"');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'HEAD':
    case 'GET':    
        $upload_handler = new UploadHandler();
        $upload_handler->get();
        break;
    case 'POST':           
        $upload_handler = new UploadHandler();
        $upload_handler->post();
               
        break;
    case 'DELETE':
        $Data = null;
        parse_str(file_get_contents('php://input'), $Data);
        //$_POST['file'] = $Data["file"];    
        $upload_handler = new UploadHandler();        
        $upload_handler->delete($Data);
        break;
    default:
        header('HTTP/1.0 405 Method Not Allowed');
}
?>