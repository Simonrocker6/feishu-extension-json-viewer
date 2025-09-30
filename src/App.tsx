import './App.css';
import { bitable } from '@lark-base-open/js-sdk';
import { Button, Icon } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';

export default function App() {
  const [formattedData, setFormattedData] = useState<Record<string, any> | any[] | null>(null);

  useEffect(() => {
    const off = bitable.base.onSelectionChange(async () => {
      try {
        const sel = await bitable.base.getSelection();
        if (!sel.tableId || !sel.recordId || !sel.fieldId) return;

        const table = await bitable.base.getTableById(sel.tableId);
        const cellVal = await table.getCellValue(sel.fieldId, sel.recordId);
        
        // 处理不同类型的单元格值
        let rawData: string | null = null;
        
        if (typeof cellVal === 'string') {
          rawData = cellVal;
        } else if (Array.isArray(cellVal)) {
          // 处理富文本/多选等数组类型
          rawData = cellVal.map(item => item.text || '').join('');
        } else if (typeof cellVal === 'object' && cellVal !== null) {
          // 直接是对象/数组
          rawData = JSON.stringify(cellVal);
        }

        if (!rawData || rawData.trim() === '') {
          setFormattedData(null);
          return;
        }

        // 关键修复：正确解析并格式化
        let jsonData: any;
        try {
          jsonData = JSON.parse(rawData);
        } catch (e) {
          console.error('JSON 解析失败:', e);
          setFormattedData(null);
          return;
        }

        // 确保是对象或数组（不是字符串）
        if (typeof jsonData === 'string') {
          try {
            jsonData = JSON.parse(jsonData);
          } catch (e) {
            console.error('二次解析失败:', e);
            setFormattedData(null);
            return;
          }
        }

        setFormattedData(jsonData); // 直接存储解析后的对象/数组
      } catch (e) {
        console.error('处理单元格失败:', e);
        setFormattedData(null);
      }
    });

    return () => off();
  }, []);

  const handleCopy = () => {
    if (formattedData) {
      navigator.clipboard.writeText(JSON.stringify(formattedData, null, 2)).then(() => {
        console.log('JSON 已复制');
      }).catch(err => {
        console.error('复制失败:', err);
      });
    }
  };

  return (
    <main className="main">
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        background: '#f8f9fa',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            width: '24px',
            height: '24px',
            backgroundColor: '#4285F4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon type="search" style={{ color: 'white', fontSize: '14px' }} />
          </div>
          <h4 style={{ 
            color: '#202124', 
            fontWeight: 500, 
            margin: 0,
            fontSize: '16px'
          }}>
            JSON 查看器
          </h4>
        </div>

        {formattedData ? (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #dadce0',
            overflow: 'hidden',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.5',
            boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
          }}>
            <div style={{
              padding: '12px',
              overflow: 'auto',
              maxHeight: '400px',
              whiteSpace: 'pre-wrap' // 关键：保持格式化后的缩进
            }}>
              {JSON.stringify(formattedData, null, 2)}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: '#757575',
            fontStyle: 'italic',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #dadce0'
          }}>
            点击任意单元格，若内容为 JSON 字符串将自动格式化
          </div>
        )}

        {formattedData && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '12px',
            gap: '8px'
          }}>
            <Button
              theme="solid"
              icon={<Icon type="copy" />}
              onClick={handleCopy}
              style={{ 
                backgroundColor: '#4285F4',
                borderColor: '#4285F4',
                color: 'white'
              }}
            >
              复制
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
