using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using LitJson;


namespace WPF_Kulunvalvonta
{
    public static class Information
    {
        public static string path;
        public static string ip;
        public static string port;

        public static bool IS_OK = true;

        /* Tarkistaa onko config tiedosto luettu onnistuneesti */
        /* Jos on niin käynnistää Websocketin ja tarkistaa yhteyden serveriin */
        public static void FileLoaded()
        {
            string s = FileWriter.Text;
            if (s == null)
            {


                IS_OK = false;
                UpdateForm.OpenConfig();
            }
            else
            {

                JsonData data = JsonMapper.ToObject(s);
                MainWindow.instantiate.Cursor = Cursors.None;
                ip = data["IP"].ToString();
                port = data["PORT"].ToString();

                NetTest.Test(); /* Tarkistaa yhteyden serveriin */
                MainWindow.instantiate.StartWebSocket();    /* Aloittaa websocket yhteyden */

            }
        }
        /* Apu funktio config tiedoston lukemiseksi */
        public static void Load()
        {
            path = Directory.GetCurrentDirectory() + "/configure.syke";
            FileWriter.ReadFile(path, new Threading.Callback(Information.FileLoaded));
        }
    }
}
