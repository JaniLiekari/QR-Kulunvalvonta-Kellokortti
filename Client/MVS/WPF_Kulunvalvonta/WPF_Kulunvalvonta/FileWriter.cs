using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace WPF_Kulunvalvonta
{
    static class FileWriter
    {

        static void HasFile(string path)
       {
            if (!File.Exists(path))
            {
                File.Create(path);
            }
        }
        public static void WriteInFile(string message)
        {
            string path = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
            path = Path.Combine(path, "errorLog.txt");
            HasFile(path);

            if (UpdateForm.ShowErrorLogBool)
            {
                UpdateForm.UpdateErrorLog(AddDateTime(message) + '\n');
            }

            using (StreamWriter output = new StreamWriter(path, true))
            {
                output.WriteLine(AddDateTime(message));
                output.Close();
            }
        }

        public static string AddDateTime(string message)
        {
            return DateTime.Now + " - " + message;
        }

        public static string Text;

        public static void WriteConfig(string data, string file)
        {         
            using (StreamWriter output = File.CreateText(file))
            {
                output.WriteLine(data);
                output.Close();
            }
        }


        public static void ClearLogFile()
        {
            UpdateForm.ClearErrorLog();
            string path = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
            path = System.IO.Path.Combine(path, "errorLog.txt");

            using (StreamWriter output = File.CreateText(path))
            {
                output.Write("");
                output.Close();
            }
        }

        public static async void ReadFile(string file, Threading.Callback cb)
        {
            try
            {
                using (StreamReader sr = new StreamReader(file))
                {
                    string line = await sr.ReadToEndAsync();
                    Text = line;
                    cb.Invoke();
                }
            }
            catch (FileNotFoundException ex)
            {
                Text = null;
                cb.Invoke();
            }
        }

    }
}
