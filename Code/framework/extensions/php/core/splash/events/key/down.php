<?php
    /*
        spl@sh (Class)

        File name: down.php (Version: 4.6)
        Description: This file contains the "Server - KEY DOWN" actions.

        Coded by George Delaportas (G0D/ViR4X)
        Copyright (C) 2013 - 2025
        Open Software License (OSL 3.0)
    */

    /* ------------------------ BEGIN ------------------------ */

    function Server_Key_Down($params)
    {
        $message = HELPERS::Parse_Event_Parameters($params);

        if ($message === false)
            return false;

        return $message;
    }

    /* ------------------------- END ------------------------- */
?>
