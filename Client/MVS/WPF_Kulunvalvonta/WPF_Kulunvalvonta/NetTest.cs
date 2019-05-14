using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;

namespace WPF_Kulunvalvonta
{
    static class NetTest
    {
        public static float ErrorRetryTime = 10f;

        public static void Test()
        {
            Console.WriteLine("Start NetTest....");
            if (MainWindow.instantiate.Dispatcher.CheckAccess())
            {
                if (IsNetWorkOk())
                {
                    MainWindow.instantiate.Time.Visibility = System.Windows.Visibility.Hidden;
                    MainWindow.instantiate.Error.Visibility = System.Windows.Visibility.Hidden;
                    MainWindow.instantiate.Active();
                }
                else
                {
                    Threading.WaitWithOutput(5f, Test, UpdateForm.UpdateTime);
                    FileWriter.WriteInFile("ERROR: PING - "+Information.ip+" - RESULT FAILED");
                    UpdateForm.UpdateError("Faced unhandled error while ping test! :(");
                }
            }
            else
            {
                object[] obj =
                {
                  
                };
                MainWindow.instantiate.Dispatcher.Invoke(new Threading.Callback(Test), obj);
            }
        }
        static bool IsNetWorkOk()
        {
            Ping x = new Ping();
            PingReply reply = x.Send(IPAddress.Parse(Information.ip));
            return reply.Status == IPStatus.Success;
        }
    }
}
