import React from "react";
export class ErrorBoundary extends React.Component{
    state = {hasError: false, error:null };

    static getDerivedStateFromError(error){
        return {hasError: true, error};
    }

    componentDidCatch(error,info) {
        console.error("Error caught:", error, info);
    }

    render() {
        if(this.state.hasError) {
            return(
                <div className="error-fallback">
                    <h2> Something went wrong</h2>
                    <details>
                        <summary>Error Details</summary>
                        <pre>{this.state.error.toString()}</pre>
                    </details>
                    <button onClick={() => window.location.reload()}>Refresh App</button>
                </div>
            );
        }
        return this.props.children;
    }
}