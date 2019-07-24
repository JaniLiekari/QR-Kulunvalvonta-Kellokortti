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

        /* Varmistaa että tiedosto on olemassa. Jos ei ole, niin luo tiedoston */
       static void HasFile(string path)
       {
            if (!File.Exists(path))
            {
                File.Create(path);
            }
        }

        /* Kirjoittaa virhelokiin viestin */ 
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

        /* Asettaa viestin eteen aikaleiman */
        public static string AddDateTime(string message)
        {
            return DateTime.Now + " - " + message;
        }

        /* Väliaikainen holderi luetulle tekstille. */
        public static string Text;

        /* Kirjoittaa dataa config tiedostoon */
        public static void WriteConfig(string data, string file)
        {         
            using (StreamWriter output = File.CreateText(file))
            {
                output.WriteLine(data);
                output.Close();
            }
        }

        /* Tyhjentää loki tiedoston / kirjoittaa loki tiedostoon "" (En varma onko täysin sama kuin tyhjä?) */
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

        /* Lukee tiedoston ja tallentaa datan ylempänä olevaan Text holderiin */
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
