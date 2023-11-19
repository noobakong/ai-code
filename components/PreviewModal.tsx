'use client'

import { useEffect, useState } from 'react'
import Prism from 'prismjs'
import classNames from 'classnames'
import 'prismjs/components/prism-cshtml'

import 'prismjs/themes/prism-tomorrow.css'
import type { CodeItem } from '@/app/store/zustand'

export function PreviewModal({
  codeItem,
  onHandleClose,
}: {
  codeItem: CodeItem
  onHandleClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'image'>('preview')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  useEffect(() => {
    const highlight = async () => {
      await Prism.highlightAll() // <--- prepare Prism
    }
    highlight() // <--- call the async function
  }, [codeItem, activeTab]) // <--- run when post updates

  if (!codeItem)
    return null

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      className="bg-white rounded-lg shadow-xl flex flex-col"
      style={{
        width: 'calc(100% - 64px)',
        height: 'calc(100% - 64px)',
      }}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex space-x-1">
          <TabButton
            active={activeTab === 'image'}
            onClick={() => {
              setActiveTab('image')
            }}
          >
            草图
          </TabButton>
          <TabButton
            active={activeTab === 'preview'}
            onClick={() => {
              setActiveTab('preview')
            }}
          >
            代码预览
          </TabButton>
          <TabButton
            active={activeTab === 'code'}
            onClick={() => {
              setActiveTab('code')
            }}
          >
            代码
          </TabButton>

        </div>

        <button
          className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          onClick={onHandleClose}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            >
            </path>
          </svg>
        </button>
      </div>

      {activeTab === 'preview'
      && (
        <>
          <div className="w-full flex justify-center">
            <button
              className="w-[50px] bg-slate-400 m-2"
              onClick={() => {
                setDevice('desktop')
              }}
            >
              pc
            </button>
            <button
              className="w-[50px] bg-slate-400 m-2"
              onClick={() => {
                setDevice('mobile')
              }}
            >
              mobile

            </button>
          </div>
          <div className="w-full flex justify-center">

            <iframe
              className={
          classNames(
            'border-[4px] border-black rounded-[20px] shadow-lg',
            'transform scale-[0.9] origin-top',
            {
              'w-full h-[832px]': device === 'desktop',
              'w-[450px] h-[832px]': device === 'mobile',
            },
          )
        }
              srcDoc={codeItem.html}
            />
          </div>
        </>
      )}
      {
        activeTab === 'code'
        && (
          <pre className="overflow-auto p-4">
            <code className="language-markup">{codeItem.html}</code>
          </pre>
        )
      }
      {
        activeTab === 'image'
        && (
          <div className="flex justify-center items-center w-full h-full overflow-auto">
            <img src={codeItem.png} alt="" className="w-full h-full object-contain" />
          </div>
        )
      }
    </div>
  )
}

interface TabButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  active: boolean
}

function TabButton({ active, ...buttonProps }: TabButtonProps) {
  const className = active
    ? 'px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-t-md focus:outline-none focus:ring'
    : 'px-4 py-2 text-sm font-medium text-blue-500 bg-transparent hover:bg-blue-100 focus:bg-blue-100 rounded-t-md focus:outline-none focus:ring'
  return <button className={className} {...buttonProps}></button>
}
