   M S B A M L   `   `   `  ���� L  HWPF_Kulunvalvonta, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null5clr-namespace:WPF_KulunvalvontaWPF_Kulunvalvonta  "    WPF_Kulunvalvonta.MainWindow   W SPresentationCore, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35R NWindowsBase, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35D 9http://schemas.microsoft.com/winfx/2006/xaml/presentation    R NSystem.Xaml, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     @d2http://schemas.microsoft.com/expression/blend/2008     Jmc;http://schemas.openxmlformats.org/markup-compatibility/2006     1localclr-namespace:WPF_Kulunvalvonta       � Title$  Kulunvalvonta�� � WindowStartupLocation$ CenterScreen=� � WindowStyle$
 None=� � Topmost .  � 
ResizeMode$ NoResize=� � WindowState$ 	Maximized=�.��� -    �Name$ BG�����#232323 � RowDefinitions �� $	��79* ��� $
��383* ��� $	��47* ��� $	��26* � � ColumnDefinitions �� $��* ��� $��3* ��� $��* �.+��� $��Syke Kulunleimaus��$��Center=�$��Center=�$��52(�$��78��$
��Bold"�$��3��$��0,0,-4,0q�$��Center=�
�������$��Expanded&�	 J� Effect	 3  -System.Windows.Media.Effects.DropShadowEffect  � -   $ FullScreenLogGrid��$��3��$��4��$y�Hidden=�.+��� -   
 ��Name$
 FullScreenLog��$��0q�$��Hidden=�$
��Auto=���. ���	#00000000
��� � �$��3,3,3,15q�$��15(�$��3��$��4��.���� -   $��	0,0,29,15q�$	��101��$��25��$��Right=�$��Bottom=� � Cursor$ Arrow��.���� $��Center=�$��Center=� J� RenderTransformOrigin$ 0.5,0.5&�$��31��$��91��$��Center=�$��Right=�$
��Bold"�.��	Clear Log�� -    ��Name$
 Time��$��Label��$��3��$��Bottom=�
�������$��Center=�$��26��$��1��$
��Bold"�$��Bottom=�$y�Hidden=��� -   $ Error��$��Label��$��2��$��Bottom=�$��Center=�$��33��$��1��$
��Bold"�$��16(�$��Bottom=����	#00000000
�������$��0,0,0,15q�$��2��$y�Hidden=�	   �� $��Close Alt + F4��$��3��$	��184��$��2��
�������$
��Bold"�$��29,0,0,0q�$
��Left=�$��Bottom=�$��Bottom=�$��26���� $��1��$��	64,0,54,4q�
���   ����	#FF343434$��Center=�$	��342��$	��379��$��Center=�$��0��$��1��$y�Hidden=�	      ShadowDepth$ 2Q�   
BlurRadius$ 4Q�� -   $
 Conf��$y�Hidden=�$��1��$��1�� �� �� $��55 ��� $��55 ��� $��55 ��� $��55 ���  �� $��* ��� $��* ��� $��* �.+��� $��1��$��1��$��Yhdistämis-asetukset��
�������$
��Bold"�$��18(�$��40��$��Center=�$��Center=��� $��2��$��1��$��Server IP:   ��
�������$
��Bold"�$��14(�$��40��$
��Left=�$��Center=��� -   $��InputIP��$��2��$��1��$	��240��$��40��$��Right=�$��Center=��� $��3��$��1��$��Server PORT:   ��
�������$
��Bold"�$��14(�$��40��$
��Left=�$��Center=��� -	   $��	InputPORT��$��3��$��1��$	��240��$��40��$��Right=�$��Center=��� -
   $
��btn1��
�������
���   �$��4q�$��4��$��1��$��Center=�$��Center=�$��40��$	��300��.��
Tallenna� -   $ Center��$��1��$��1��$��Center=�$��Center=�$	��379��$��	0,120,0,0q�$ 0.5,0.5&�$y�Hidden=�.+��� -   $
 Type��$��Kirjauduttu ulos��$��Center=�$��	0,0,0,300q�$��Center=�$	��400��$��60��$��Center=�$��Center=�
�������$
��Bold"�$��36(�	   $ 3Q��� -   $
 Name��$��Nimi: Mikko Mallikas��$��Center=�$��	0,0,0,130q�$��Center=�$	��400��$��36��$��Center=�$
��Bold"�$��20(�$��	4.7,5,5,5q�&   System.Windows.Media.TextOptions   TextHintingMode$ Fixed=�$��0q�
������ 
��������� -   $
 Date��$��
14.03.2019��$��Center=�$��	0,0,0,200q�$��Center=�$	��400��$��28��$��Center=�
�������$
��Bold"�$��16(�$	��0,5q�$��Right=��� -   $ LogTime��$��10:30��$��Center=�$��	0,0,0,200q�$��Center=�$	��400��$��28��$��Center=�
�������$
��Bold"�$��16(�$��	10,5,20,5q��� -   $ Between��$��Kirjautuneena: 2h 30min��$��Center=�$��0,0,0,60q�$��Center=�$	��400��$��36��$��Center=�
�������$
��Bold"�$��20(�$��5q��� -   $ InputC��$��Cancel Input Shift + 5��$��2��$��3��$��Bottom=�$��26��
�������$	��153��$
��Bold"�$��Right=�$��Right=�$��5,5,10,5q�$��Bottom=�$y�Hidden=�