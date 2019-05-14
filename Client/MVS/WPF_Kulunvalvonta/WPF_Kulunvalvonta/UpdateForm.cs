using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace WPF_Kulunvalvonta
{
    static class UpdateForm
    {

        public delegate void Callback();
        public delegate void Callback2(string message);

        public static bool ShowErrorLogBool = false;

        public static void UpdateTime(float time)
        {

          

            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {
                MainWindow.instantiate.Time.Visibility = System.Windows.Visibility.Visible;
                MainWindow.instantiate.Time.Content = "Re-connecting soon: " + time +" sec.";
            }
            else
            {
                object[] obj =
                {
                    time
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Output(UpdateTime), obj);
            }
        }
        public static void UpdateCancleInput(bool state)
        {
            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {
                if (state)
                    MainWindow.instantiate.InputC.Visibility = System.Windows.Visibility.Visible;
                else
                    MainWindow.instantiate.InputC.Visibility = System.Windows.Visibility.Hidden;
            }
            else
            {
                object[] obj =
                {
                   
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Output_b(UpdateCancleInput), obj);
            }
        }
        public static void UpdateError(string message, bool autohide = true)
        {
            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {
                MainWindow.instantiate.Error.Visibility = System.Windows.Visibility.Visible;
                MainWindow.instantiate.Error.Content = message;
                if(autohide)
                    Threading.Wait(5, HideError);
            }
            else
            {
                object[] obj =
                {
                    message,
                    autohide
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Output_ss(UpdateError), obj);
            }
        }


        public static void HideAndActive()
        {

            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {

                MainWindow.instantiate.Error.Visibility = System.Windows.Visibility.Hidden;
                MainWindow.instantiate.ReActive();
            }
            else
            {
                object[] obj =
                {

                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Callback(HideAndActive), obj);
            }
        }

        public static void UpdateErrorCallback(string message, bool autohide = true)
        {
            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {
                MainWindow.instantiate.Error.Visibility = System.Windows.Visibility.Visible;
                MainWindow.instantiate.Error.Content = message;
                if (autohide)
                    Threading.Wait(5, HideAndActive);
            }
            else
            {
                object[] obj =
                {
                    message,
                    autohide
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Output_ss(UpdateErrorCallback), obj);
            }
        }


        public static void ClearErrorLog()
        {
            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {


                if (ShowErrorLogBool)
                {

                    MainWindow.instantiate.FullScreenLog.Text = "";
                    MainWindow.instantiate.FullScreenLog.ScrollToEnd();

                }
                else
                {
                    //.....
                }

            }
            else
            {
                object[] obj =
                {
            
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Callback(ClearErrorLog), obj);
            }
        }

        public static void UpdateErrorLog(string message)
        {
            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {

             
                if (ShowErrorLogBool)
                {

                    MainWindow.instantiate.FullScreenLog.Text += message;
                    MainWindow.instantiate.FullScreenLog.ScrollToEnd();

                }
                else
                {
                    //.....
                }

            }
            else
            {
                object[] obj =
                {
                    message
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Callback2(UpdateErrorLog), obj);
            }
        }

        public static void ShowErrorLog()
        {

            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {

                ShowErrorLogBool = !ShowErrorLogBool;

                if (ShowErrorLogBool)
                {

                    MainWindow.instantiate.FullScreenLogGrid.Visibility = System.Windows.Visibility.Visible;
                    MainWindow.instantiate.FullScreenLog.Text = FileWriter.Text;
                    MainWindow.instantiate.FullScreenLog.ScrollToEnd();

                }
                else
                {
                    MainWindow.instantiate.FullScreenLogGrid.Visibility = System.Windows.Visibility.Hidden;
                }

            }
            else
            {
                object[] obj =
                {

                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Callback(ShowErrorLog), obj);
            }
          
        }

        public static void OpenConfig()
        {
            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {
                MainWindow.instantiate.Conf.Visibility = System.Windows.Visibility.Visible;
            }
            else
            {
                object[] obj =
                {

                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Callback(OpenConfig), obj);
            }
        }
        public static void HideError()
        {
            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {

                MainWindow.instantiate.Error.Visibility = System.Windows.Visibility.Hidden;
            }
            else
            {
                object[] obj =
                {
       
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Callback(HideError), obj);
            }
        }
    }
}
