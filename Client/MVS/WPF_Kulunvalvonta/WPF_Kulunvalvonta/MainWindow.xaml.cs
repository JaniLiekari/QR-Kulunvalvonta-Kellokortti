using System;
using System.Windows;
using System.Windows.Media;
using System.Runtime.InteropServices;
/* 3party from nugget */
using WebSocketSharp; 


namespace WPF_Kulunvalvonta
{

    /* NÄMÄ OVAT NÄYTÖN SULKEMISEN ESTÄMISTÄ VARTEN */

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

    /************************************************/


    public partial class MainWindow : Window
    {
       
        public static MainWindow instantiate;                       // Tämä luokka toimii singleton rakennuspalasena muille luokille.
        public MessageHandler messageHandler;                       // Hallinnoi syötteen lähettämisen serverille ja serverin vastausten hoitamisen.
        InputHandler handler;                                       // Hallinnoi syötteen kirjaamisen.
        WebSocket ws = null;                                        // Itse websocketti.
        System.Threading.Thread WEBSOCKETHANDLER = null;            // Websocket thread.
        bool WS_Connecting = false;                                 // Flagi onko ws yhteys muodostettu.
        public MainWindow()
        {
            InitializeComponent();                                  // WPF (windows ??? forms) default funktio. 
            instantiate = this;
            PreventSleep();                                         // Estää näytön sammumisen.
            messageHandler = new MessageHandler();                 
            Information.Load();                                     // Ladataan config tiedot (IP , PORT)
        }

        public void StartWebSocket()
        {

            WS_Connecting = true;
                                                     // Dispatcheria tulee näkymään paljon koodissa.
            if (this.Dispatcher.CheckAccess())       // Dispatcher.CheckAccess tarkistaa että komentoa ajetaanko UI threadissa. Jos ajetaan palauttaa se TRUE
            {
               
                string uri = "ws://" + Information.ip + ":3330";
                Console.WriteLine(Information.ip);
                string[] protocol = new string[]
                {
                    "echo-protocol"
                };

                ws = new WebSocket(url: uri, protocols: protocol);

                /* Eventit websocketille */
                ws.OnOpen += (sender2, e2) => OpenedWS();       
                ws.OnError += (sender3, e3) => ErrorWS();
                ws.OnClose += (sender4, e4) => CloseWS();
                /*************************/

                ws.Origin = "http://127.0.0.1:3330";
                ws.Connect();
               

                if (WEBSOCKETHANDLER == null)
                {
                    /* Threadi joka pitää huolen että ws yhteys pysyy muodostettuna / hoitaa uudelleen yhdistämiset */
                    System.Threading.ThreadStart start = new System.Threading.ThreadStart(WEBSOCKET_AUTORECONNECT);
                    WEBSOCKETHANDLER = new System.Threading.Thread(start);
                    WEBSOCKETHANDLER.IsBackground = true;
                    WEBSOCKETHANDLER.Start();
                }

               
            }
            else
            {
                /* Jos kyseessä ei ollut UI threadi, ladataan funktio uudestaan UI threadissa */
                MainWindow.instantiate.Dispatcher.Invoke(StartWebSocket);

            }

        }

        /* En saanut toimimaan websocketsharpin automaattista uudelleen yhdistämistä järkevästi siksi tämä threadi */
        public void WEBSOCKET_AUTORECONNECT()
        {

            /* 
             * 
             * Käytin tosi simppeliä lyhyttä nukkumista ja +1 laskemista,
             * koska jostain syystä Thread.Sleep jäädytti myös UI threadin vaikka tämä funktio
             * pyörii omassa threadissaan.
             * 
             */

            int interval = 0;
            while (true)
            {
                if (interval >= 10000)
                {
                    interval = 0;

                    if (!ws.IsAlive && !WS_Connecting)
                    {
                        StartWebSocket();
                    }

                }


                System.Threading.Thread.Sleep(10);
                interval += 1;

            }
        }

        /* Websocket Eventit */
        void OpenedWS()
        {
            WS_Connecting = false;
            Console.WriteLine("OPENWS");
            ws.Send("Reader");
        }

        void ErrorWS()
        {
            Console.WriteLine("ERRORWS");
            WS_Connecting = false;
            
        }

        void CloseWS()
        {
            Console.WriteLine("CLOSEWS");
            WS_Connecting = false;
        }
        /********************/

       
        /* Apu funktio config tietojen tallentamiseen */
        void SaveConf(object sender, RoutedEventArgs e)
        {
            string ip = InputIP.Text;
            string port = InputPORT.Text;

            string json = "{\"IP\":\""+ip+"\",\"PORT\":\""+port+"\"}"; // Json string.

            Conf.Visibility = Visibility.Hidden;

            FileWriter.WriteConfig(json, Information.path);
            Information.Load();

        }

        // Pyyhkii local loki tiedoston.
        void ClearLog(object sender, RoutedEventArgs e)
        {
            FileWriter.ClearLogFile();
        }

        /* Aktivoi syötteen lukemisen */
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


        /* Uudelleen aktivoi syötteen lukemisen */
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

        /* Estää näytön sammumisen */
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
