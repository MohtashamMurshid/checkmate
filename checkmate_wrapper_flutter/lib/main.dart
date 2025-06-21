import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import 'dart:async';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TikTok Checkmate',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: TikTokShareHandler(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class TikTokShareHandler extends StatefulWidget {
  @override
  _TikTokShareHandlerState createState() => _TikTokShareHandlerState();
}

class _TikTokShareHandlerState extends State<TikTokShareHandler> {
  late StreamSubscription _intentDataStreamSubscription;
  WebViewController? _webViewController;
  bool _isLoading = true;
  String _defaultUrl = 'https://checkmate-imaginehack.vercel.app/';
  String _statusMessage = 'Ready to receive TikTok shares';

  @override
  void initState() {
    super.initState();
    _initializeWebView();
    _setupShareIntentListener();
    _checkInitialIntent();
  }

  void _initializeWebView() {
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
              _statusMessage = 'Analysis complete';
            });
          },
          onWebResourceError: (WebResourceError error) {
            print('WebView error: ${error.description}');
          },
        ),
      )
      ..loadRequest(Uri.parse(_defaultUrl));
  }

  void _setupShareIntentListener() {
    // Listen for shared content while app is running
    _intentDataStreamSubscription = ReceiveSharingIntent.instance.getMediaStream().listen(
      (List<SharedMediaFile> sharedFiles) {
        _handleSharedFiles(sharedFiles);
      },
      onError: (err) {
        print('Error receiving shared content: $err');
      },
    );
  }

  void _checkInitialIntent() {
    // Check if app was opened via share intent
    ReceiveSharingIntent.instance.getInitialMedia().then((List<SharedMediaFile> sharedFiles) {
      if (sharedFiles.isNotEmpty) {
        _handleSharedFiles(sharedFiles);
        // Tell the library that we are done processing the intent
        ReceiveSharingIntent.instance.reset();
      }
    });
  }

  void _handleSharedFiles(List<SharedMediaFile> sharedFiles) {
    print('Received shared files: ${sharedFiles.map((f) => f.toMap())}');
    
    setState(() {
      _statusMessage = 'Processing shared content...';
    });
    
    // Look for text content or URLs in the shared files
    String? sharedContent;
    for (SharedMediaFile file in sharedFiles) {
      // For text content, the path usually contains the actual text
      if (file.type == SharedMediaType.text || file.type == SharedMediaType.url) {
        sharedContent = file.path;
        break;
      }
    }
    
    if (sharedContent != null) {
      _handleSharedContent(sharedContent);
    } else {
      setState(() {
        _statusMessage = 'No text content found in shared files';
      });
      _showErrorDialog('No text content found in shared files');
    }
  }

  void _handleSharedContent(String sharedContent) {
    print('Processing shared content: $sharedContent');
    
    setState(() {
      _statusMessage = 'Processing shared content...';
    });
    
    // Extract TikTok URL from shared content
    String? tiktokUrl = sharedContent.trim();// _extractTikTokUrl(sharedContent);
    
    if (tiktokUrl != null) {
      setState(() {
        _statusMessage = 'Loading TikTok video...';
      });
      _loadTikTokInWebView(tiktokUrl);
    } else {
      setState(() {
        _statusMessage = 'No valid TikTok link found';
      });
      _showErrorDialog('No valid TikTok link found in shared content');
    }
  }

  String? _extractTikTokUrl(String text) {
    // Common TikTok URL patterns
    List<RegExp> patterns = [
      RegExp(r'https?://(?:www\.)?tiktok\.com/@[^/]+/video/\d+[^\s]*'),
      RegExp(r'https?://(?:vm|vt)\.tiktok\.com/[A-Za-z0-9]+/?[^\s]*'),
      RegExp(r'https?://(?:www\.)?tiktok\.com/t/[A-Za-z0-9]+/?[^\s]*'),
    ];

    for (RegExp pattern in patterns) {
      Match? match = pattern.firstMatch(text);
      if (match != null) {
        return match.group(0);
      }
    }
    
    return null;
  }

  void _loadTikTokInWebView(String tiktokUrl) {
    // URL encode the TikTok link
    String encodedUrl = Uri.encodeComponent(tiktokUrl);
    String finalUrl = 'https://checkmate-imaginehack.vercel.app/?link=$encodedUrl';
    
    print('Loading URL: $finalUrl');
    
    setState(() {
      _isLoading = true;
      _statusMessage = 'Loading checkmate analysis...';
    });

    _webViewController?.loadRequest(Uri.parse(finalUrl));
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Error'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('OK'),
            ),
          ],
        );
      },
    );
  }


  @override
  void dispose() {
    _intentDataStreamSubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _webViewController!),
            if (_isLoading)
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                    ),
                    SizedBox(height: 16),
                    Text(
                      _statusMessage,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Test with a sample TikTok URL
          _handleSharedContent('https://www.tiktok.com/@amrizal366/video/7500220572404616503');
        },
        child: Icon(Icons.play_arrow),
        backgroundColor: Colors.black,
        tooltip: 'Test with sample TikTok',
      ),
    );
  }
}