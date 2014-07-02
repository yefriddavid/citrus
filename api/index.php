<?php

require '../Slim/Slim.php';

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();
$app->contentType('application/json');
$app->expires('-1000000');
$db = new PDO('sqlite:db.sqlite3');

function getTitleFromUrl($url) {
    preg_match('/<title>(.+)<\/title>/', file_get_contents($url), $matches);

    return mb_convert_encoding($matches[1], 'UTF-8', 'UTF-8');
}

//function getFaviconFromUrl($url)
//{
//    $url = parse_url($url);
//    $url = urlencode(sprintf('%s://%s', 
//        isset($url['scheme']) ? $url['scheme'] : 'http', 
//        isset($url['host']) ? $url['host'] : strtolower($url['path'])));
//    
//    return "http://g.etfv.co/$url";
//}
//function saveFavicon($url, $id)
//{
//    file_put_contents("../icons/$id.ico", file_get_contents(getFaviconFromUrl($url)));
//}

function returnResult($action, $success = true, $id = 0) {
//    echo json_encode([
//        'action' => $action,
//        'success' => $success,
//        'id' => intval($id),
//    ]);
    echo json_encode(array(
        'action' => $action,
        'success' => $success,
        'id' => intval($id),
    ));
}

$app->get('/files/:questionId/', function ($questionId) use ($db, $app) {
    $path = dirname(__FILE__) . "/files";
    $sth = null;
    $sth = $db->prepare('SELECT f.* FROM files as f inner join filesByQuestions as fq on fq.fileId = f.fileId WHERE fq.questionId = ? order by f.localFileName;');

    $sth->execute(array(intval($questionId)));
    $files = $sth->fetchAll();
    $result = array();
    foreach ($files as $key => $value) {
        $name = $value["localFileName"];
        $thumbnails = null;
        if (file_exists(dirname(__FILE__) . "/thumbnails/$name"))
            $thumbnails = "api/thumbnails/$name";
        else {
            if (strpos(".pdf", $name)) {
                $thumbnails = "img/pdf.png";
            } elseif (strpos($name,".xls") || strpos($name,".xlsx")) {
                $thumbnails = "img/xls.png";
            } elseif (strpos($name,".docx") || strpos($name,".doc")) {
                $thumbnails = "img/doc.png";
            } else {
                $thumbnails = "img/file.png";
            }
        }
        $result[] = array(
            "localFileName" => $name,
            "remoteFileName" => $value["remoteFileName"],
            "size" => filesize($path . "/" . $name),
            "thumbnails" => $thumbnails
        );
    }
    print json_encode($result);
});
/* Retorna todos los archivos con o sin pregunta */
$app->get('/files/get/questions/:questionId/', function ($questionId) use ($db, $app) {
    $sth = null;
    //$sth = $db->query('SELECT f.*, fq.questionId FROM files as f left JOIN filesByQuestions as fq on fq.fileId = f.fileId WHERE fq.questionId is null or fq.questionId is not null');
    $sth = $db->prepare('SELECT f.*, (select fq.questionId from filesByQuestions as fq where fq.fileId = f.fileId and fq.questionId=?) questionId FROM files as f');
    $sth->execute(array(intval($questionId)));
    //print "aca";
    $fles = $sth->fetchAll(PDO::FETCH_CLASS);
    print json_encode($fles);
});
$app->get('/files/', function () use ($db, $app) {
    $sth = $db->query('SELECT f.* FROM files as f');

    $files = $sth->fetchAll(PDO::FETCH_CLASS);
    $result = array();
    $path = dirname(__FILE__) . "/files";
    foreach ($files as $key => $value) {
        $name = $value->localFileName;
        $thumbnails = null;
        if (file_exists(dirname(__FILE__) . "/thumbnails/$name"))
            $thumbnails = "api/thumbnails/$name";
        else {
            if (strpos(".pdf", $name) !== false) {
                $thumbnails = "img/pdf.png";
            } elseif (strpos($name, ".xls") !== false || strpos($name, ".xlsx") !== false) {
                $thumbnails = "img/xls.png";
            } elseif (strpos($name, ".docx") !== false || strpos($name, ".doc") !== false) {
                $thumbnails = "img/doc.png";
            } else {
                $thumbnails = "img/file.png";
            }
        }
        $result[] = array(
            "localFileName" => $name,
            "remoteFileName" => $value->remoteFileName,
            //"url" => filesize($path . "/" . $name),
            "size" => filesize($path . "/" . $name),
            "thumbnails" => $thumbnails
        );
    }
    echo json_encode($result);
});

$app->get('/login/:login/:password', function ($login, $password) use ($db, $app) {
//    $password = $app->request()->post('identification');
//    $login = $app->request()->post('identification');
    $sth = $db->query('SELECT * FROM users WHERE login = ? AND password=? LIMIT 1;');
    $sth->execute(array($login, $password));
    $data = $sth->fetchAll(); //PDO::FETCH_CLASS);
    $id = null;
    //print($password);
    if ($data) {
        $data = $data[0];
        //var_dump($data);
        //$id = $data["userId"];
        //$data = true;//echo json_encode($data[0]);
    } else {
        $data = false; /* No retornar nada */
    }
    returnResult('login', $data, $id);
});
$app->get('/users', function () use ($db, $app) {
    $sth = $db->query('SELECT * FROM users;');
    echo json_encode($sth->fetchAll(PDO::FETCH_CLASS));
});
$app->get('/users/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('SELECT * FROM users WHERE userId = ? LIMIT 1;');
    $sth->execute(array(intval($id)));
    $data = $sth->fetchAll(PDO::FETCH_CLASS);
    echo json_encode($data[0]);
});
$app->put('/users/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('UPDATE users SET identification = ?,'
            . 'login = ?, '
            . 'fullName = ?, '
            . 'password = ?,'
            . 'isRoot = ?,'
            . 'mail = ? WHERE userId = ?;');
    $identification = $app->request()->post('identification');
    $login = $app->request()->post('login');
    $fullName = $app->request()->post('fullName');
    $password = $app->request()->post('password');
    $mail = $app->request()->post('mail');
    $isRoot = $app->request()->post('isRoot');

    $sth->execute(array(
        $identification,
        $login,
        $fullName,
        $password, $isRoot,
        $mail,
        intval($id))
    );
    returnResult('add', $sth->rowCount() == 1, $id);
});
$app->post('/users', function () use ($db, $app) {
    $identification = $app->request()->post('identification');
    $login = $app->request()->post('login');
    $fullName = $app->request()->post('fullName');
    $password = $app->request()->post('password');
    $mail = $app->request()->post('mail');
    $isRoot = $app->request()->post('isRoot');

    $sth = $db->prepare('INSERT INTO users ('
            . 'identification, '
            . 'login,'
            . 'fullName,'
            . 'password,'
            . 'isRoot,'
            . 'mail) VALUES (?,?,?,?,?,?);');
    $sth->execute(array(
        $identification,
        $login,
        $fullName,
        $password,
        $isRoot,
        $mail)
    );
    returnResult('add', $sth->rowCount() == 1, $db->lastInsertId());
});
$app->delete('/users/:id', function ($id) use ($db) {
    $sth = $db->prepare('DELETE FROM users WHERE userId = ?;');
    $sth->execute(array(intval($id)));
    returnResult('delete', $sth->rowCount() == 1, $id);
});
$app->get('/questions', function () use ($db, $app) {
    $sth = $db->query('SELECT q.*,c.name as categorie FROM questions as q inner join categories as c on q.categorieId = c.categorieId order by q.categorieId,q.userCode ASC');
    $data = $sth->fetchAll(PDO::FETCH_CLASS);
    if ($data) {
        foreach ($data as $key => $value) {
            $value->response = html_entity_decode($value->response);
            $value->question = html_entity_decode($value->question);
        }
        echo json_encode($data);
    } else {
        echo json_encode(array());
    }
});
/* Indica si ya existe el consecutivo para esta categoria */
//parametros opcionales por si la pregunta es nueva
$app->get('/questions(/:questionId)/:categorieId/:userCode', function ($questionId = "-1", $categorieId, $userCode) use ($db, $app) {
    //print $questionId;exit;
    $sth = $db->prepare('SELECT * FROM questions WHERE questionId <> ? AND categorieId= ? AND userCode = ? LIMIT 1;');
    $sth->execute(array($questionId, $categorieId, $userCode));
    $data = $sth->fetchAll(PDO::FETCH_CLASS);
    $rs = null;
    if ($data) {
        $rs = true;
    } else {
        $rs = false;
    }
    //print_r($data);
    echo json_encode($rs);
});
$app->get('/categories/validate(/:categorieId)/:name', function ($categorieId = "-1", $name) use ($db, $app) {
    //print $questionId;exit;
    $sth = $db->prepare('SELECT * FROM categories WHERE categorieId <> ? AND name= ? LIMIT 1;');
    $sth->execute(array($categorieId, $name));
    $data = $sth->fetchAll(PDO::FETCH_CLASS);
    $rs = null;
    if ($data) {
        $rs = true;
    } else {
        $rs = false;
    }
    //print_r($data);
    echo json_encode($rs);
});
$app->get('/questions/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('SELECT * FROM questions WHERE questionId = ? LIMIT 1;');
    //$sth = $db->prepare('SELECT q.*,c.name as categorie FROM questions as q inner join categories as c on q.categorieId = c.categorieId WHERE q.questionId = ? LIMIT 1;');
    $sth->execute(array(intval($id)));
    //$data = $sth->fetchAll();
    $data = $sth->fetchAll(PDO::FETCH_CLASS);
    if ($data) {
        $data = $data[0];
        $data->response = html_entity_decode($data->response);
        $data->question = html_entity_decode($data->question);
    } else {
        $data = array();
    }
    echo json_encode($data);
});
$app->post('/questions', function () use ($db, $app) {
    $categorieId = $app->request()->post('categorieId');
    $question = $app->request()->post('question');
    $response = $app->request()->post('response');
    $userCode = $app->request()->post('userCode');
    $files = $app->request()->post('files');
    $files = explode(",", $files);
    $sth = $db->prepare('INSERT INTO questions (categorieId, question,response,userCode) VALUES (?,?,?,?);');
    $sth->execute(array($categorieId, $question, $response, $userCode));
    $lastInsertId = $db->lastInsertId();
    if (is_array($files)) {
        foreach ($files as $key => $fileId) {
            if ($fileId != "") {
                $sth = $db->prepare('INSERT INTO filesByQuestions (fileId, questionId) VALUES (?,?);');
                $sth->execute(array($fileId, $lastInsertId));
            }
        }
    }
    returnResult('add', $sth->rowCount() == 1, $lastInsertId);
});
$app->put('/questions/:questionId', function ($questionId) use ($db, $app) {
    $sth = $db->prepare('UPDATE questions SET '
            . 'categorieId = ?, '
            . 'question = ?, '
            . 'response = ?, '
            . 'userCode = ? WHERE questionId = ?;');
    $categorieId = $app->request()->post('categorieId');
    $userCode = $app->request()->post('userCode');
    $response = $app->request()->post('response');
    $question = $app->request()->post('question');
    $files = $app->request()->post('files');
    $files = explode(",", $files);
//    if (stripos($response, "&lt;") === false) {//0 = no
//        $response = htmlentities($response);
//    }
//    if (stripos($question, "&lt;") === false) {//0 = no
//        $question = htmlentities($question);
//    }

    /* No */
    $sth->execute(array(
        $categorieId,
        $question,
        $response,
        $userCode,
        intval($questionId))
    );
    $sth = $db->prepare('DELETE FROM filesByQuestions WHERE questionId = ?;');
    $sth->execute(array($questionId));

    foreach ($files as $key => $fileId) {
        //print $fileId . "\n";
        if ($fileId != "") {
            $sth = $db->prepare('INSERT INTO filesByQuestions (fileId, questionId) VALUES (?,?);');
            $sth->execute(array($fileId, $questionId));
        }
    }
//    }     
    returnResult('add', $sth->rowCount() == 1, $questionId);
});
$app->delete('/questions/:id', function ($id) use ($db) {
    $sth = $db->prepare('DELETE FROM questions WHERE questionId = ?;');
    $sth->execute(array(intval($id)));
    returnResult('delete', $sth->rowCount() == 1, $id);
});
$app->get('/dictionaries', function () use ($db, $app) {
    $sth = $db->query('SELECT * FROM dictionaries;');
    echo json_encode($sth->fetchAll(PDO::FETCH_CLASS));
});
$app->get('/dictionaries/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('SELECT * FROM dictionaries WHERE dictionaryId = ? LIMIT 1;');
    $sth->execute(array(intval($id)));
    $data = $sth->fetchAll(PDO::FETCH_CLASS);
    echo json_encode($data[0]);
});
$app->post('/dictionaries', function () use ($db, $app) {
    $term = $app->request()->post('term');
    $definition = $app->request()->post('definition');
    $sth = $db->prepare('INSERT INTO dictionaries (term, definition) VALUES (?, ?);');
    $sth->execute(array($term, $definition));
    returnResult('add', $sth->rowCount() == 1, $db->lastInsertId());
});
$app->put('/dictionaries/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('UPDATE dictionaries SET term = ?, definition = ? WHERE dictionaryId = ?;');
    $term = $app->request()->post('term');
    $definition = $app->request()->post('definition');
    $sth->execute(array(
        $term,
        $definition,
        intval($id))
    );
    returnResult('add', $sth->rowCount() == 1, $id);
});
$app->delete('/dictionaries/:id', function ($id) use ($db) {
    $sth = $db->prepare('DELETE FROM dictionaries WHERE dictionaryId = ?;');
    $sth->execute(array(intval($id)));
    returnResult('delete', $sth->rowCount() == 1, $id);
});

/* Parameters */
$app->get('/parameters', function () use ($db, $app) {
    $sth = $db->query('SELECT * FROM parameters;');
    echo json_encode($sth->fetchAll(PDO::FETCH_CLASS));
});
$app->get('/parameters/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('SELECT * FROM parameters WHERE parameterId = ? LIMIT 1;');
    $sth->execute(array(intval($id)));
    $data = $sth->fetchAll(PDO::FETCH_CLASS);
    echo json_encode($data[0]);
});
$app->put('/parameters/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('UPDATE parameters SET name = ?, value = ? WHERE parameterId = ?;');
    $name = $app->request()->post('name');
    $value = $app->request()->post('value');
    $sth->execute(array(
        $name,
        $value,
        intval($id))
    );
    returnResult('add', $sth->rowCount() == 1, $id);
});
$app->get('/categories', function () use ($db, $app) {
    $sth = $db->query('SELECT * FROM categories;');
    echo json_encode($sth->fetchAll(PDO::FETCH_CLASS));
});
$app->get('/categories/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('SELECT * FROM categories WHERE categorieId = ? LIMIT 1;');
    $sth->execute(array(intval($id)));
    $data = $sth->fetchAll(PDO::FETCH_CLASS);
    echo json_encode($data[0]);
});
$app->post('/categories', function () use ($db, $app) {
    $name = $app->request()->post('name');
    $description = $app->request()->post('description');
    $sth = $db->prepare('INSERT INTO categories (name, description) VALUES (?, ?);');
    $sth->execute(array($name, $description));
    returnResult('add', $sth->rowCount() == 1, $db->lastInsertId());
});
$app->put('/categories/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('UPDATE categories SET name = ?, description = ? WHERE categorieId = ?;');
    $name = $app->request()->post('name');
    $description = $app->request()->post('description');
    $sth->execute(array(
        $name,
        $description,
        intval($id))
    );
    returnResult('add', $sth->rowCount() == 1, $id);
});
$app->delete('/categories/:id', function ($id) use ($db) {
    $sth = $db->prepare('DELETE FROM categories WHERE categorieId = ?;');
    $sth->execute(array(intval($id)));
    returnResult('delete', $sth->rowCount() == 1, $id);
});





$app->post('/bookmark', function () use ($db, $app) {
    $title = $app->request()->post('title');
    $sth = $db->prepare('INSERT INTO bookmark (url, title) VALUES (?, ?);');
    $url = $app->request()->post('url');
    $title = empty($title) ? getTitleFromUrl($url) : $title;
    $sth->execute(array($url, $title));
//    $sth->execute([
//        $url = $app->request()->post('url'),
//        empty($title) ? getTitleFromUrl($url) : $title,
//    ]);
    saveFavicon($url, $id = $db->lastInsertId());

    returnResult('add', $sth->rowCount() == 1, $id);
});

$app->put('/bookmark/:id', function ($id) use ($db, $app) {
    $sth = $db->prepare('UPDATE bookmark SET title = ?, url = ? WHERE id = ?;');
    $result = $app->request()->post('title');
    $url = $app->request()->post('url');
    $sth->execute(array(
        $result,
        $url,
        intval($id))
    );
//    $sth->execute([
//        $app->request()->post('title'),
//        $url = $app->request()->post('url'),
//        intval($id),
//    ]);
    saveFavicon($url, $id);

    returnResult('add', $sth->rowCount() == 1, $id);
});

$app->delete('/bookmark/:id', function ($id) use ($db) {
    $sth = $db->prepare('DELETE FROM bookmark WHERE id = ?;');
    $sth->execute(array(intval($id)));

    unlink("../icons/$id.ico");

    returnResult('delete', $sth->rowCount() == 1, $id);
});

$app->get('/install', function () use ($db) {
    $db->exec('	CREATE TABLE IF NOT EXISTS bookmark (
					id INTEGER PRIMARY KEY, 
					title TEXT, 
					url TEXT UNIQUE);');

    returnResult('install');
});

$app->run();
