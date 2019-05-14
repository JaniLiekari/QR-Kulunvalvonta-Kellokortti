using System;
using System.Windows;
using System.Windows.Media;
using System.Runtime.InteropServices;
using WebSocketSharp;


namespace WPF_Kulunvalvonta
{
    [FlagsAttribute]
    public enum EXECUTION_STATE : uint
    {
        ES_SYSTEM_REQUIRED = 0x00000001,
        ES_DISPLAY_REQUIRED = 0x00000002,
        ES_AWAYMODE_REQUIRED = 0x00000040,
        ES_CONTINUOUS = 0x80000000,
    }
    public static class SleepUtil
    {
        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern EXECUTION_STATE SetThreadExecutionState(EXECUTION_STATE esFlags);
    }

    public partial class MainWindow : Window
    {
        public static MainWindow instantiate;
        public MessageHandler messageHandler;
        InputHandler handler;
        WebSocket ws = null;
        System.Threading.Thread WEBSOCKETHANDLER = null;
        bool WS_Connecting = false;
        public MainWindow()
        {
            InitializeComponent();
            instantiate = this;
            PreventSleep();
            messageHandler = new MessageHandler();
            Information.Load();
        }

        public void StartWebSocket()
        {

            WS_Connecting = true;

            if (this.Dispatcher.CheckAccess())
            {
               
                string uri = "ws://" + Information.ip + ":3330";
                string[] protocol = new string[]
                {
                "echo-protocol"
                };

                ws = new WebSocket(url: uri, protocols: protocol);

                ws.OnOpen += (sender2, e2) => OpenedWS();
                ws.OnError += (sender3, e3) => ErrorWS();
                ws.OnClose += (sender4, e4) => CloseWS();
                ws.Origin = "http://127.0.0.1:3330";
                ws.Connect();
               

                if (WEBSOCKETHANDLER == null)
                {

                    System.Threading.ThreadStart start = new System.Threading.ThreadStart(WEBSOCKET_AUTORECONNECT);
                    WEBSOCKETHANDLER = new System.Threading.Thread(start);
                    WEBSOCKETHANDLER.IsBackground = true;
                    WEBSOCKETHANDLER.Start();
                }

               
            }
            else
            {
               
                MainWindow.instantiate.Dispatcher.Invoke(StartWebSocket);

            }

        }


        public void WEBSOCKET_AUTORECONNECT()
        {
            while (true)
            {
                
                if (!ws.IsAlive && !WS_Connecting)
                {
                    StartWebSocket();
                }


                System.Threading.Thread.Sleep(10000);

            }
        }


        void OpenedWS()
        {
            WS_Connecting = false;
            ws.Send("Reader");
        }

        void ErrorWS()
        {
            WS_Connecting = false;
            
        }

        void CloseWS()
        {
            WS_Connecting = false;
        }

       

        void SaveConf(object sender, RoutedEventArgs e)
        {
            string ip = InputIP.Text;
            string port = InputPORT.Text;

            string json = "{\"IP\":\""+ip+"\",\"PORT\":\""+port+"\"}";

            Conf.Visibility = Visibility.Hidden;

            FileWriter.WriteConfig(json, Information.path);
            Information.Load();



        }

        void ClearLog(object sender, RoutedEventArgs e)
        {
            FileWriter.ClearLogFile();
        }

        public void Active()
        {
            if (!Dispatcher.CheckAccess())
            {
                object[] obj =
                {

                };
                Dispatcher.Invoke(new Threading.Callback(Active), obj);
                return;
            }
            if (handler != null)
            {
                ReActive();
            }
            else
            {
                handler = new InputHandler(messageHandler.SendMessage);
                this.KeyDown += handler.Log;
            }
        }
        public void ReActive()
        { 
            if (!Dispatcher.CheckAccess())
            {
                object[] obj =
                {
                   
                };
                Dispatcher.Invoke(new Threading.Callback(ReActive), obj);
                return;
            }
            BG.Background = new SolidColorBrush(Color.FromArgb(255, 35, 35, 35));
            Center.Visibility = Visibility.Hidden;
            handler.Cancel();
        }
        public void PreventSleep()
        {
            if (SleepUtil.SetThreadExecutionState(EXECUTION_STATE.ES_CONTINUOUS
                | EXECUTION_STATE.ES_DISPLAY_REQUIRED
                | EXECUTION_STATE.ES_SYSTEM_REQUIRED
                | EXECUTION_STATE.ES_AWAYMODE_REQUIRED) == 0) //Away mode for Windows >= Vista
                SleepUtil.SetThreadExecutionState(EXECUTION_STATE.ES_CONTINUOUS
                    | EXECUTION_STATE.ES_DISPLAY_REQUIRED
                    | EXECUTION_STATE.ES_SYSTEM_REQUIRED); //Windows < Vista, forget away mode
        }
    }
}
