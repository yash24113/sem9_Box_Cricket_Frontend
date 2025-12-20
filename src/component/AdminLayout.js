import React from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

const AdminLayout = ({ children, title = "" }) => {

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                flexDirection: "column",
                background: "#f4f6f9",
            }}
        >
            <AdminHeader />
            <div style={{ display: "flex", flex: 1 }}>
                <AdminSidebar />
                <div
                    style={{
                        flex: 1,
                        padding: 20,
                        overflowY: "auto",
                        background: "#eef2f7",
                    }}
                >
                    {children}
                </div>
            </div>
            <AdminFooter />
        </div>
    );
};

export default AdminLayout;
