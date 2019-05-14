using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
namespace WPF_Kulunvalvonta
{
    static class Threading
    {
        public delegate void Callback();
        public delegate void Output(float f);
        public delegate void Output_s(string s);
        public delegate void Output_ss(string s, bool a);
        public delegate void Output_b(bool b);
        static List<Thread> threads = new List<Thread>();
        public static DateTime startTime;

        public static void Wait(float seconds, Callback callback)
        {
            int milliseconds = (int)(seconds * 1000);
            Thread t = new Thread(() => Timer(milliseconds, callback));
            threads.Add(t);
            t.Start();
        }
        public static void WaitWithOutput(float seconds, Callback callback, Output output)
        {
            int milliseconds = (int)(seconds * 1000);
            Thread t = new Thread(() => TimerWithOutput(milliseconds, callback, output));
            threads.Add(t);
            t.Start();
        }
        static void Timer(int milliseconds, Callback callback)
        {
            Thread.Sleep(milliseconds);
            threads.Remove(Thread.CurrentThread);
            callback.Invoke();
        }
        public static Thread InputTimer(int seconds, Callback callback)
        {
            Thread t = new Thread(() => InputThreadTimer(seconds, callback));
            threads.Add(t);
            t.Start();
            return t;
        }
        static void InputThreadTimer(int seconds, Callback callback)
        {

            DateTime startTime = DateTime.Now;
            while (true)
            {
                TimeSpan duration = DateTime.Parse(DateTime.Now.ToString()).Subtract(DateTime.Parse(startTime.ToString()));
                if (duration.Seconds >= seconds)
                {
                    break;
                }
                Thread.Sleep(10);
            }
            InputHandler.ignoreInput = true;
            FileWriter.WriteInFile("TIME CANCELED: QR READING TIME CANCELED");
            UpdateForm.UpdateError("Time cancel reading..");
            callback.Invoke();

        }
        public static void CancelThread(Thread t)
        {
            if(t.IsAlive) t.Abort();

            if (threads.Contains(t))
            {
                threads.Remove(t);
            }

        }
        static void TimerWithOutput(int milliseconds, Callback callback, Output output)
        {
            startTime = DateTime.Now;

            while (true)
            {
                TimeSpan duration = DateTime.Parse(DateTime.Now.ToString()).Subtract(DateTime.Parse(startTime.ToString()));
                output.Invoke(milliseconds / 1000 - duration.Seconds);
                if(duration.Seconds >= milliseconds/1000)
                {
                    break;
                }
                Thread.Sleep(10);
            }
            threads.Remove(Thread.CurrentThread);
            callback.Invoke();
         
        }
        public static void AbortAll()
        {
            foreach(Thread t in threads)
            {
                t.Abort();
            }
            threads.Clear();
        }
    }
}
