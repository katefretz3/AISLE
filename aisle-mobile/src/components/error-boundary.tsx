"use client";
// Last line of defence.
//
// Without this, one render error anywhere unmounts the whole tree and leaves a
// blank white screen with no way out — on a phone, indistinguishable from the
// app being broken for good. This keeps the household's data intact (it lives
// in device storage, not in React state) and offers the two things that
// actually recover: reload, or go back to the start.
import {Component,type ErrorInfo,type ReactNode} from 'react';
import {RotateCcw,TriangleAlert} from 'lucide-react';

type Props={children:ReactNode};
type State={error:Error|null};

export default class ErrorBoundary extends Component<Props,State>{
 state:State={error:null};

 static getDerivedStateFromError(error:Error):State{return {error};}

 componentDidCatch(error:Error,info:ErrorInfo){
  // No analytics service is connected, and adding one would contradict the
  // privacy policy, so this stays in the device console for a bug report.
  console.error('Aisle recovered from a render error',error,info.componentStack);
 }

 render(){
  if(!this.state.error)return this.props.children;
  return <div className="crash-screen" role="alert">
   <span className="crash-icon"><TriangleAlert size={26}/></span>
   <h1>Something went wrong on this screen.</h1>
   <p>Your list and preferences are saved on this device and have not been changed.
    Reloading usually clears it.</p>
   <div className="crash-actions">
    <button className="button primary" onClick={()=>window.location.reload()}>
     <RotateCcw size={16}/> Reload Aisle
    </button>
    <button className="button secondary" onClick={()=>{window.location.hash='#home';window.location.reload();}}>
     Go to My week
    </button>
   </div>
   <details className="crash-detail">
    <summary>Technical details</summary>
    <pre>{this.state.error.message}</pre>
   </details>
  </div>;
 }
}
