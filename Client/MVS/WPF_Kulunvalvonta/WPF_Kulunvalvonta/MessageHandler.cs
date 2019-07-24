using System;
using System.IO;
using System.Net;
using System.Text;
using System.Windows;
using System.Windows.Media;

/* 3party from Nugget. Tosi kätevä apuri Jsonia käsitellessä. Myös Unitylle tehty versio löytyy */
using LitJson; 
/************************************************************************************************/

namespace WPF_Kulunvalvonta
{
    public class MessageHandler
    {
        /* Huonosti nimetty funktio. Hoitaa niin puretun qr datan lähettämisen kuin myös serveriltä tulevan vastauksen */
        public void SendMessage(string message)
        {

            if (!MainWindow.instantiate.Dispatcher.CheckAccess())
            {
                object[] obj =
               {
                    message
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Output_s(SendMessage), obj);
                return;
            }

            
            UpdateForm.UpdateError("CONNECTING....", false);     /* UI funktio */

            /* Uusi HttpWebRequest + params + Header data */
            var request = (HttpWebRequest)WebRequest.Create("http://" + Information.ip + ":" + Information.port + "/api");
            var postData = "qr=" + message;
            var data = Encoding.ASCII.GetBytes(postData);
            Console.WriteLine("message: " + message);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = data.Length;
            /**********************************************/

            try
            {
                using (var stream = request.GetRequestStream())
                {
                    stream.Write(data, 0, data.Length);
                }

                var response = (HttpWebResponse)request.GetResponse();
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    UpdateForm.HideError();
                    /* Serverin vastaus. Vastaus on muotoa Json */
                    var responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();  

                    Console.WriteLine("STATUS OK");


                    /* *********************************************************************
                     * Tekee Json stringistä uuden objektin. 
                     * Tyyliltään kuin javascript objekti (Lohko = Objekti['lohko'] ---> Alalohko = Lohko['Alalohko'] ) 
                     * *********************************************************************/
                    JsonData json = JsonMapper.ToObject(responseString);

                    if (json["status"].ToString() == "404") /* Käyttäjää ei löytynyt Qr koodin avulla */
                    {
                        FileWriter.WriteInFile("ERROR: RESPONSE USER NOT FOUND! - QR=" + message); /* Kirjaa virhe lokiin */
                        UpdateForm.UpdateErrorCallback("KÄYTTÄJÄÄ EI LÖYTYNYT!");                  /* UI funktio */
                        MainWindow.instantiate.BG.Background = new SolidColorBrush(Color.FromArgb(255, 147, 0, 17));
                        response.Close();
                        return;

                    }else if(json["status"].ToString() == "message") /* Virhe ilmoitus viesti (vapaa päivä) */
                    {
                        FileWriter.WriteInFile("ERROR: "+json["time"].ToString()+" - QR=" + message);
                        UpdateForm.UpdateErrorCallback(json["time"].ToString());
                        MainWindow.instantiate.BG.Background = new SolidColorBrush(Color.FromArgb(255,178, 156, 41));
                        
                        response.Close();
                        return;
                    }
                    else  /* Joko kirjaudutaan sisään tai ulos vastaus */
                    {   
                        string resp = "Kirjaudutaan ulos";
                        MainWindow.instantiate.Name.Content = json["firstname"].ToString() + " " + json["lastname"].ToString();
                        Console.WriteLine(json["firstname"].ToString() + " " + json["lastname"].ToString());
                        MainWindow.instantiate.LogTime.Content = DateTime.Now.Hour + ":" + DateTime.Now.Minute;
                        MainWindow.instantiate.Date.Content = DateTime.Now.ToString("d.M.yyyy");

                        if (json["loggedin"].ToString() == "true")
                        {
                            Console.WriteLine("Logged in: " + json["loggedin"].ToString());
                            resp = "Kirjaudutaan sisään";
                            MainWindow.instantiate.Between.Visibility = System.Windows.Visibility.Hidden;

                        }
                        else
                        {
                            MainWindow.instantiate.Between.Visibility = System.Windows.Visibility.Visible;
                            MainWindow.instantiate.Between.Content = "Kirjautuneena: " + json["timebetween"].ToString();
                            Console.WriteLine("Logged in: " + json["loggedin"].ToString());
                            if (json["daydone"].ToString() == "true")
                            {
                                MainWindow.instantiate.BG.Background = new SolidColorBrush(Color.FromArgb(255, 43, 132, 35));
                            }
                            else
                            {
                                MainWindow.instantiate.BG.Background = new SolidColorBrush(Color.FromArgb(255, 147, 0, 17));
                            }
                        }

                        MainWindow.instantiate.Type.Content = resp;
                        MainWindow.instantiate.Center.Visibility = Visibility.Visible;
                    }
                }

                Threading.Wait(5, MainWindow.instantiate.ReActive); /* Asettaa 5 sekunnin odotuksen kunnes uudelleen aktivoi syötteen lukemisen */
                response.Close();
            }
            catch (WebException ex)
            {
                Console.WriteLine("error: " + ex.ToString());
                request.Abort();
                Threading.Wait(3, NetTest.Test);
                //UpdateForm.UpdateError("Connection Error");
            }

        }
    }
}
